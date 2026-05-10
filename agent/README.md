# begeniux-langgraph

The agent half of begeniux. A LangGraph node that reasons over a behavior summary + design system + DOM snapshot and emits CSS-level UI adaptations via the `apply_adaptations` frontend tool.

This is published separately from the React library (`begeniux` on npm) because they live in different runtimes — but they're shipped from the same repo and versioned together. **Both are first-class parts of the begeniux project**, not optional companions.

```
React app ──── CopilotKit ───► LangGraph agent (this package) ────► Gemini / Claude
                                       │
                                       ▼
                           apply_adaptations(plan)
                                       │
              ◄────── CopilotKit returns tool call to browser
                                       │
                                       ▼
                       begeniux AdaptationEngine mutates DOM
```

## Install

```bash
pip install begeniux-langgraph        # Gemini (default)
pip install "begeniux-langgraph[claude]"   # also installs langchain-anthropic
```

Or with uv:

```bash
uv add begeniux-langgraph
```

Requires Python 3.11+.

## Run locally

```bash
cd agent
cp .env.example .env
# edit .env, set GEMINI_API_KEY=...
uv sync
langgraph dev --port 8133
```

Verify:

```bash
curl http://localhost:8133/info
```

Then point your CopilotKit Runtime at it. Minimal Hono BFF:

```ts
import { CopilotRuntime, createCopilotEndpoint } from "@copilotkit/runtime";
import { LangGraphAgent } from "@ag-ui/langgraph";

const runtime = new CopilotRuntime({
  agents: {
    default: new LangGraphAgent({
      deploymentUrl: "http://localhost:8133",
      graphId: "default",
    }),
  },
});

export const app = createCopilotEndpoint({ runtime, basePath: "/api/copilotkit" });
```

## Use it inside your existing LangGraph

Don't want to run the standalone agent? Compose the begeniux graph into your own:

```python
from begeniux_agent import build_graph, build_system_prompt

# Standalone graph
graph = build_graph(runtime="gemini-flash")

# Or extend the system prompt with your domain
prompt = build_system_prompt(
    extra_instructions="""
    This deployment is an e-commerce product listing page. Pay extra
    attention to cart_abandonment patterns — see summary.custom.cart_abandons.
    """
)
graph = build_graph(runtime="gemini-flash", system_prompt=prompt)
```

## Use it as a node, not a graph

If you already have a LangGraph and want adaptive UI as one capability among many, import the system prompt and bind your existing tools:

```python
from langchain.agents import create_agent
from copilotkit import CopilotKitMiddleware
from langchain_google_genai import ChatGoogleGenerativeAI
from begeniux_agent.prompts import SYSTEM_PROMPT

llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", api_key=...)

graph = create_agent(
    model=llm,
    tools=your_existing_backend_tools,    # apply_adaptations comes from CopilotKit at runtime
    system_prompt=f"{SYSTEM_PROMPT}\n\n{your_domain_instructions}",
    middleware=[CopilotKitMiddleware(), *your_existing_middleware],
)
```

## What it does, exactly

On every CopilotKit-driven turn it has access to:

- **`summary`**: a `BehaviorSummary` (clicks_per_min, rage_clicks, avg_dwell_ms, scroll_depth, hover_count, form_interactions, errors_seen, viewport, custom, page_context). The browser publishes this via `useCopilotReadable`.
- **`designSystem`**: the host app's declared CSS variables and classes — the **vocabulary** the agent is allowed to use. Anything outside the manifest is rejected by the engine.
- **`dom.visibleSelectors`**: a list of stable selectors currently in the viewport. The agent should target only these — never invent selectors.

Output: a single tool call to `apply_adaptations(adaptations[], confidence, reasoning)`. The React side applies the plan; every new plan reverts the previous one before applying so mutations don't accumulate.

The full system prompt lives at [`src/begeniux_agent/prompts.py`](./src/begeniux_agent/prompts.py). It's the IP of this package — tune it carefully.

## Switching models

Set `BEGENIUX_RUNTIME`:

| Value | Model | Notes |
|---|---|---|
| `gemini-flash` (default) | `gemini-2.0-flash` | Cheap, fast, good enough for v0 |
| `claude-sonnet-4-6` | `claude-sonnet-4-6` | Better reasoning. Requires `langchain-anthropic`. |
| `noop` | none | Silent fallback returned automatically when no API key is set. |

Override the exact model id with `BEGENIUX_GEMINI_MODEL` or `BEGENIUX_CLAUDE_MODEL`.

## What this package is NOT

- **Not the React library.** Install [`begeniux`](https://www.npmjs.com/package/begeniux) on the browser side.
- **Not a CopilotKit Runtime.** You still need to mount `@copilotkit/runtime` somewhere (Next.js API route, Hono BFF, Express). This package is the agent that the runtime calls.
- **Not multi-tenant infrastructure.** It's a LangGraph node. Run it, autoscale it, embed it in your own platform — that's all your call.

## License

MIT — same as the React library and the parent project. See [`../LICENSE`](../LICENSE).
