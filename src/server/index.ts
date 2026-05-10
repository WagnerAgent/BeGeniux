// begeniux/server — LangGraph.js agent that fulfills the ClassifyFn contract.
//
// One-import path for Next.js / Vite + Node consumers:
//
//   // app/api/begen/route.ts
//   import { createBeGenHandler } from "begeniux/server";
//   export const POST = createBeGenHandler({
//     apiKey: process.env.GEMINI_API_KEY!,
//   });
//
// Internally builds a LangGraph (createReactAgent) with a single tool —
// `apply_adaptations` — whose call args ARE the structured AdaptationPlan
// the React side will execute. The agent loop runs once per HTTP request:
// system prompt + user message (the AdaptInput JSON) → LLM → tool call → done.
//
// Future v0.3 will extend the graph with DOM-inspection nodes and tool-calling
// loops; the contract (AdaptInput → AdaptationPlan) stays stable.

import type { AdaptInput, AdaptationPlan, ClassifyFn } from "../types";
import { buildLLM, type ProviderName } from "./providers";
import { SYSTEM_PROMPT, ADAPTATION_TOOL_NAME, buildSystemPrompt } from "./prompts";
import {
  adaptInputSchema,
  adaptationPlanSchema,
} from "./schemas";

export type CreateBeGenAgentOpts = {
  /** API key for whichever provider you pick. Always read from env on the server. */
  apiKey: string;
  /** Default "openai". Switch to "gemini" or "anthropic" for those models. */
  provider?: ProviderName;
  /** Model id. Defaults: "gpt-4o-mini" (openai), "gemini-2.0-flash" (gemini), "claude-sonnet-4-5-20250929" (anthropic). */
  model?: string;
  /** 0–1; default 0.2. Lower = more deterministic. */
  temperature?: number;
  /** Override or extend the begeniux system prompt. */
  systemPrompt?: string;
  /** Append to the canonical system prompt instead of replacing. */
  extraInstructions?: string;
  /** Optional OpenAI-compatible base URL (Azure, OpenRouter, local proxy, …). */
  baseUrl?: string;
};

const FALLBACK_PLAN: AdaptationPlan = {
  adaptations: [],
  confidence: 0,
  reasoning: "begeniux/server: agent error; returned empty plan.",
};

/**
 * Returns a ClassifyFn ready to drop into BeGenProvider's `classify` prop —
 * but typically you'd wrap it in createBeGenHandler and call it via HTTP
 * so your API key never leaves the server.
 */
export function createBeGenAgent(opts: CreateBeGenAgentOpts): ClassifyFn {
  let agentPromise: Promise<unknown> | null = null;

  async function getAgent() {
    if (agentPromise) return agentPromise;
    agentPromise = buildAgent(opts);
    return agentPromise;
  }

  return async (input: AdaptInput) => {
    try {
      const agent = (await getAgent()) as { invoke: (s: unknown) => Promise<any> };
      const result = await agent.invoke({
        messages: [
          { role: "user", content: JSON.stringify(input) },
        ],
      });
      const plan = extractAdaptationPlan(result);
      return plan ?? FALLBACK_PLAN;
    } catch {
      return FALLBACK_PLAN;
    }
  };
}

/**
 * Returns a Web-Fetch-style handler (Request → Response) you can mount in:
 *   - Next.js App Router: `export const POST = createBeGenHandler(opts);`
 *   - Hono: `app.post("/begen", createBeGenHandler(opts));`
 *   - Cloudflare Workers, Deno, Bun — anywhere fetch's Request/Response live.
 */
export function createBeGenHandler(
  opts: CreateBeGenAgentOpts,
): (req: Request) => Promise<Response> {
  const classify = createBeGenAgent(opts);
  return async (req: Request) => {
    let payload: unknown;
    try {
      payload = await req.json();
    } catch {
      return Response.json(
        { ...FALLBACK_PLAN, reasoning: "begeniux/server: invalid JSON body." },
        { status: 200 },
      );
    }

    const parsed = adaptInputSchema.safeParse(payload);
    if (!parsed.success) {
      return Response.json(
        {
          ...FALLBACK_PLAN,
          reasoning: `begeniux/server: invalid AdaptInput shape: ${parsed.error.message.slice(0, 200)}`,
        },
        { status: 200 },
      );
    }

    const plan = await classify(parsed.data as AdaptInput);
    return Response.json(plan, { status: 200 });
  };
}

// ─── Internals ──────────────────────────────────────────────────────

async function buildAgent(opts: CreateBeGenAgentOpts) {
  const llm = await buildLLM({
    provider: opts.provider,
    model: opts.model,
    apiKey: opts.apiKey,
    temperature: opts.temperature,
    baseUrl: opts.baseUrl,
  });

  const { tool } = await import("@langchain/core/tools");
  const { createReactAgent } = await import("@langchain/langgraph/prebuilt");

  // The "tool" the agent calls server-side is a no-op that simply echoes the
  // structured args back. Its real purpose is to constrain the LLM to emit a
  // JSON object matching the AdaptationPlan schema. We extract those args
  // from the agent's message history and return them as the HTTP response.
  const applyAdaptations = tool(
    async (args) => JSON.stringify(args),
    {
      name: ADAPTATION_TOOL_NAME,
      description:
        "Commit your CSS-only adaptation plan. The arguments are returned to the browser; emitting an empty `adaptations: []` is a valid no-op.",
      schema: adaptationPlanSchema,
    },
  );

  const systemPrompt =
    opts.systemPrompt ?? buildSystemPrompt(opts.extraInstructions);

  return createReactAgent({
    llm,
    tools: [applyAdaptations],
    messageModifier: systemPrompt,
  });
}

function extractAdaptationPlan(agentResult: any): AdaptationPlan | null {
  // createReactAgent returns { messages: BaseMessage[] }. We want the most
  // recent ToolMessage whose `name` is apply_adaptations OR the most recent
  // AIMessage with a tool_calls[] entry for apply_adaptations.
  const messages = agentResult?.messages;
  if (!Array.isArray(messages)) return null;

  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];

    // AI message with tool_calls
    const toolCalls = m?.tool_calls ?? m?.additional_kwargs?.tool_calls;
    if (Array.isArray(toolCalls) && toolCalls.length > 0) {
      for (const tc of toolCalls) {
        const name = tc?.name ?? tc?.function?.name;
        if (name !== ADAPTATION_TOOL_NAME) continue;
        const rawArgs =
          tc?.args ??
          (typeof tc?.function?.arguments === "string"
            ? safeParseJson(tc.function.arguments)
            : tc?.function?.arguments);
        const validated = adaptationPlanSchema.safeParse(rawArgs);
        if (validated.success) return validated.data as AdaptationPlan;
      }
    }

    // Tool message echoing the args back
    if (m?.name === ADAPTATION_TOOL_NAME) {
      const content = typeof m.content === "string" ? safeParseJson(m.content) : m.content;
      const validated = adaptationPlanSchema.safeParse(content);
      if (validated.success) return validated.data as AdaptationPlan;
    }
  }
  return null;
}

function safeParseJson(s: unknown): unknown {
  if (typeof s !== "string") return s;
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

export type { ProviderName } from "./providers";
export { SYSTEM_PROMPT, buildSystemPrompt, ADAPTATION_TOOL_NAME } from "./prompts";
