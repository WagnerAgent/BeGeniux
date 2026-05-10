"""LangGraph entry point — `langgraph dev --port 8133` reads `graph` from here.

Wires:
- A switchable runtime selected by BEGENIUX_RUNTIME (gemini-flash | claude-sonnet-4-6).
  Defaults to gemini-flash. Falls back to a noop graph if no API key is set so the
  library doesn't hang on first turn.
- The begeniux adaptive UI system prompt (see begeniux_agent.prompts).
- CopilotKitMiddleware so the React side's `apply_adaptations` frontend tool is
  forwarded into the agent's tool list at run time.

Frontend tools are NOT bound here — see `begeniux_agent/runtime.py`. Binding
them on the Python side would cause Gemini to reject the request with
"Duplicate function declaration found".
"""

from __future__ import annotations

import os

from dotenv import load_dotenv

load_dotenv()


from begeniux_agent.runtime import build_graph  # noqa: E402


_runtime = os.getenv("BEGENIUX_RUNTIME", "gemini-flash")
print(f"[begeniux-agent] runtime={_runtime}", flush=True)

_gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or ""
_anthropic_key = os.getenv("ANTHROPIC_API_KEY") or ""

# Fall back to noop if no relevant key is present.
if _runtime == "gemini-flash" and (not _gemini_key or _gemini_key.startswith("stub")):
    print(
        "\n  GEMINI_API_KEY missing or stub — using noop fallback graph.\n"
        "   The library will boot but won't generate adaptations until a key is set.\n",
        flush=True,
    )
    _runtime = "noop"
elif _runtime == "claude-sonnet-4-6" and (
    not _anthropic_key or _anthropic_key.startswith("stub")
):
    print(
        "\n  ANTHROPIC_API_KEY missing or stub — using noop fallback graph.\n",
        flush=True,
    )
    _runtime = "noop"


graph = build_graph(_runtime)
