"""begeniux-langgraph — the agent half of begeniux.

Reasons over a BehaviorSummary + DesignSystem + DOM snapshot and emits a
CSS-level AdaptationPlan via the `apply_adaptations` frontend tool. Drop this
into any LangGraph runtime that wraps a CopilotKit-compatible agent and the
React side (begeniux on npm) starts adapting the live UI.
"""

from .runtime import build_graph
from .prompts import (
    SYSTEM_PROMPT,
    build_system_prompt,
    ADAPTATION_TOOL_NAME,
)

__all__ = [
    "build_graph",
    "SYSTEM_PROMPT",
    "build_system_prompt",
    "ADAPTATION_TOOL_NAME",
]

__version__ = "0.1.0"
