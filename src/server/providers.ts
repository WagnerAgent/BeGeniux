// LLM provider factory. Returns a LangChain BaseChatModel that the LangGraph
// runtime can compose with. Lazy imports so a missing optional peer-dep
// (e.g. anthropic for a gemini-only deployment) doesn't break.

export type ProviderName = "openai" | "gemini" | "anthropic";

export type BuildLLMOpts = {
  provider?: ProviderName;
  model?: string;
  apiKey: string;
  temperature?: number;
  /** Optional override (OpenAI-compatible endpoints, Azure proxies, etc.). */
  baseUrl?: string;
};

const OPENAI_DEFAULT = "gpt-4o-mini";
const GEMINI_DEFAULT = "gemini-2.0-flash";
const ANTHROPIC_DEFAULT = "claude-sonnet-4-5-20250929";

export async function buildLLM(opts: BuildLLMOpts) {
  const provider = opts.provider ?? "openai";
  const temperature = opts.temperature ?? 0.2;

  if (provider === "openai") {
    const { ChatOpenAI } = await import("@langchain/openai");
    return new ChatOpenAI({
      model: opts.model ?? OPENAI_DEFAULT,
      apiKey: opts.apiKey,
      temperature,
      configuration: opts.baseUrl ? { baseURL: opts.baseUrl } : undefined,
    });
  }

  if (provider === "gemini") {
    const { ChatGoogleGenerativeAI } = await import("@langchain/google-genai");
    return new ChatGoogleGenerativeAI({
      model: opts.model ?? GEMINI_DEFAULT,
      apiKey: opts.apiKey,
      temperature,
    });
  }

  if (provider === "anthropic") {
    const { ChatAnthropic } = await import("@langchain/anthropic");
    return new ChatAnthropic({
      model: opts.model ?? ANTHROPIC_DEFAULT,
      apiKey: opts.apiKey,
      temperature,
    });
  }

  throw new Error(`begeniux/server: unknown provider "${provider as string}"`);
}
