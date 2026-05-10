// LLM provider factory. Returns a LangChain BaseChatModel that the LangGraph
// runtime can compose with. Lazy imports so a missing optional peer-dep
// (e.g. anthropic for a gemini-only deployment) doesn't break.

export type ProviderName = "gemini" | "anthropic";

export type BuildLLMOpts = {
  provider?: ProviderName;
  model?: string;
  apiKey: string;
  temperature?: number;
};

const GEMINI_DEFAULT = "gemini-2.0-flash";
const ANTHROPIC_DEFAULT = "claude-sonnet-4-5-20250929";

export async function buildLLM(opts: BuildLLMOpts) {
  const provider = opts.provider ?? "gemini";
  const temperature = opts.temperature ?? 0.2;

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
