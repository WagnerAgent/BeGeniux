import { createBeGenHandler } from "begeniux/server";

// One-line backend. The agent runs server-side, the API key never leaves.
export const POST = createBeGenHandler({
  apiKey: process.env.GEMINI_API_KEY ?? "",
  provider: "gemini",
  // model: "gemini-2.0-flash",
  // To use Claude instead:
  //   provider: "anthropic",
  //   apiKey: process.env.ANTHROPIC_API_KEY!,
});
