import { createBeGenHandler } from "begeniux/server";

// One-line backend. The agent runs server-side, the API key never leaves.
export const POST = createBeGenHandler({
  apiKey: process.env.OPENAI_API_KEY ?? "",
  provider: "openai",
  // model: "gpt-4o-mini",        // default; bump to "gpt-4o" for stronger reasoning
  // To use Gemini instead:
  //   provider: "gemini",
  //   apiKey: process.env.GEMINI_API_KEY!,
  // To use Claude:
  //   provider: "anthropic",
  //   apiKey: process.env.ANTHROPIC_API_KEY!,
});
