"""Runtime factory for the begeniux adaptive UI agent.

Builds a LangGraph that:
  1. Consumes user messages + agent state (which carries behavior summary,
     design system, DOM snapshot — published by the React side via
     CopilotKit readables).
  2. Reasons via Gemini (default) or Claude (optional) under the begeniux
     adaptive UI system prompt.
  3. Calls the `apply_adaptations` frontend tool to mutate the live DOM.

Frontend tools are NOT bound here — `CopilotKitMiddleware` injects them at
run time from the browser. Binding them in Python would cause Gemini to
reject the request with "Duplicate function declaration found".
"""

from __future__ import annotations

import os
from typing import Literal

from langgraph.graph.state import CompiledStateGraph
from copilotkit import CopilotKitMiddleware

from .prompts import SYSTEM_PROMPT


RuntimeName = Literal[
    "gemini-flash",
    "claude-sonnet-4-6",
    "noop",
]


_VALID_RUNTIMES = ("gemini-flash", "claude-sonnet-4-6", "noop")


NOOP_FALLBACK_MESSAGE = (
    "Set GEMINI_API_KEY (or ANTHROPIC_API_KEY for the claude-sonnet-4-6 runtime) "
    "to enable the begeniux adaptive UI agent. The library is otherwise wired "
    "and will adapt the live UI as soon as a key is set."
)


def build_graph(
    runtime: str = "gemini-flash",
    *,
    system_prompt: str | None = None,
    extra_tools: list | None = None,
) -> CompiledStateGraph:
    """Compile the begeniux adaptive UI agent graph.

    Args:
        runtime: One of `gemini-flash`, `claude-sonnet-4-6`, `noop`. Anything
            else falls back to `gemini-flash` with a warning.
        system_prompt: Override the default begeniux system prompt. Use
            `prompts.build_system_prompt(extra_instructions=...)` to extend
            rather than replace.
        extra_tools: Backend tools to bind in addition to whatever the
            CopilotKit middleware forwards from the browser. Most apps
            don't need this — the apply_adaptations tool comes from the
            frontend automatically.
    """
    if runtime not in _VALID_RUNTIMES:
        print(
            f"[begeniux-agent] WARN: unknown runtime={runtime!r}; "
            f"falling back to gemini-flash",
            flush=True,
        )
        runtime = "gemini-flash"

    prompt = system_prompt or SYSTEM_PROMPT
    tools = list(extra_tools or [])
    middleware = [CopilotKitMiddleware()]

    if runtime == "noop":
        return _build_noop(NOOP_FALLBACK_MESSAGE)
    if runtime == "gemini-flash":
        return _build_gemini(tools, prompt, middleware)
    if runtime == "claude-sonnet-4-6":
        return _build_claude(tools, prompt, middleware)

    raise RuntimeError(f"unreachable runtime branch: {runtime!r}")


# ── Noop fallback ─────────────────────────────────────────────────────

from langgraph.graph.message import add_messages as _add_messages
from typing_extensions import Annotated as _Annotated, TypedDict as _TypedDict


class _NoopState(_TypedDict):
    messages: _Annotated[list, _add_messages]


def _build_noop(message: str) -> CompiledStateGraph:
    """No-LLM fallback that always replies with `message`.

    Used when GEMINI_API_KEY (or ANTHROPIC_API_KEY) is missing so the
    library doesn't hang on first turn with an opaque auth error.
    """
    from langgraph.graph import END, START, StateGraph
    from langchain_core.messages import AIMessage

    def respond(_state: _NoopState) -> dict:
        return {"messages": [AIMessage(content=message)]}

    graph = StateGraph(_NoopState)
    graph.add_node("respond", respond)
    graph.add_edge(START, "respond")
    graph.add_edge("respond", END)
    return graph.compile()


# ── Gemini ────────────────────────────────────────────────────────────


def _gemini_llm():
    """Build the configured Gemini chat model.

    Default model: `gemini-2.0-flash`. Override the model in your wrapper
    if you want gemini-3.1-flash-lite (the hackathon default) or any other
    supported tier — the system prompt is model-agnostic.
    """
    from langchain_google_genai import ChatGoogleGenerativeAI

    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or "stub"
    return ChatGoogleGenerativeAI(
        model=os.getenv("BEGENIUX_GEMINI_MODEL", "gemini-2.0-flash"),
        temperature=0.2,
        api_key=api_key,
    )


def _build_gemini(
    tools: list,
    system_prompt: str,
    middleware: list,
) -> CompiledStateGraph:
    """Gemini Flash + react agent. The default and the cheapest path."""
    from langchain.agents import create_agent

    return create_agent(
        model=_gemini_llm(),
        tools=tools,
        system_prompt=system_prompt,
        middleware=middleware,
    )


# ── Claude ────────────────────────────────────────────────────────────


def _build_claude(
    tools: list,
    system_prompt: str,
    middleware: list,
) -> CompiledStateGraph:
    """Claude Sonnet 4.6 + react agent. Requires `langchain-anthropic`.

    Install with: `pip install begeniux-langgraph[claude]` or
    `uv add langchain-anthropic`.
    """
    from langchain.agents import create_agent
    from langchain_anthropic import ChatAnthropic

    api_key = os.getenv("ANTHROPIC_API_KEY") or ""
    if not api_key:
        print(
            "\n  ANTHROPIC_API_KEY is unset. The agent will boot but the\n"
            "   first turn will fail with an auth error. Set\n"
            "   ANTHROPIC_API_KEY in your env.\n",
            flush=True,
        )

    llm = ChatAnthropic(
        model=os.getenv("BEGENIUX_CLAUDE_MODEL", "claude-sonnet-4-6"),
        temperature=0.2,
        api_key=api_key or "stub",
    )
    return create_agent(
        model=llm,
        tools=tools,
        system_prompt=system_prompt,
        middleware=middleware,
    )
