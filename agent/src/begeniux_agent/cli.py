"""Entry point for `begeniux-agent` CLI.

Defers to `langgraph dev` since that's the canonical local-dev runner.
For production deployments, mount the graph (from `main.py:graph`) under
your own LangGraph runtime.
"""

from __future__ import annotations

import os
import subprocess


def main() -> None:
    port = os.getenv("BEGENIUX_AGENT_PORT", "8133")
    subprocess.run(
        ["langgraph", "dev", "--port", port],
        check=True,
    )


if __name__ == "__main__":
    main()
