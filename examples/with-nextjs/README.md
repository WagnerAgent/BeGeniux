# begeniux · Next.js demo

A vanilla Next.js 15 app showing **the canonical begeniux integration**: one npm install, one API route, one provider — and the live UI starts adapting based on user behavior.

## Run

```bash
cd examples/with-nextjs
cp .env.example .env.local
# Edit .env.local: set OPENAI_API_KEY=...
npm install
npm run dev
```

The default provider is **OpenAI** (`gpt-4o-mini`). Switch to Gemini or Claude with one line in `app/api/begen/route.ts`.

Open http://localhost:3020. Click around, hover products, rage-click — watch the accent color, density, and corner radius shift in real time. The telemetry strip at the bottom shows what the agent decided and why.

## What's wired

```
Browser
   ├── app/providers.tsx    → <BeGenProvider> with the design system
   └── app/page.tsx         → product grid with data-begen-id selectors
                                (the agent targets these)

Server (Next.js API route)
   └── app/api/begen/route.ts → ONE LINE:
                                 export const POST = createBeGenHandler({
                                   apiKey: process.env.GEMINI_API_KEY!,
                                 });

Agent
   └── begeniux/server      → LangGraph.js + OpenAI gpt-4o-mini (default)
                               (or "gemini" / "anthropic" — one prop change)
```

Behind the scenes the React side accumulates a `BehaviorSummary`, posts it to `/api/begen` with the design system manifest and a DOM snapshot, the LangGraph agent reasons over it (Gemini under the system prompt baked into begeniux/server), and emits a tool call with the `AdaptationPlan`. The provider applies it to the live DOM with full reversibility.

## What you'd change for your own app

1. **Design system** (`app/providers.tsx`): list YOUR CSS variables and class names. The agent can ONLY use what you declare.
2. **Markup**: add `data-begen-id="..."` on the elements you want the agent to be able to target. Without these, the snapshot only sees coarse selectors.
3. **CSS** (`app/globals.css`): define how your `--begen-*` variables and `.is-*` classes actually render. The agent picks values; YOU define what those values mean visually.
4. **API route**: keep the one-line handler. Swap `provider: "openai"` to `"gemini"` or `"anthropic"` if you prefer those models — same handler.
5. **Scope** (optional): add `scope.allow={["[data-begen-id]", ":root"]}` to the provider if you want a hard whitelist.

## Files

| Path | Purpose |
|---|---|
| `app/layout.tsx` | Root layout, mounts providers |
| `app/providers.tsx` | `<BeGenProvider>` with the design system + HTTP adapter |
| `app/page.tsx` | Product grid + telemetry strip |
| `app/globals.css` | Tailwind 4 + design tokens that the agent can mutate |
| `app/api/begen/route.ts` | The 1-line agent handler |
| `next.config.ts` | Aliases `begeniux` → `../../src` for live development |

## Notes

- `next.config.ts` aliases `begeniux` and `begeniux/server` to the local source so this demo tracks the library state without an `npm install begeniux` round-trip. Real consumers just install the package; the imports work the same.
- API key is read **server-side only** (`process.env.GEMINI_API_KEY`). The browser never sees it.
- All CSS mutations are reversible — refresh the page or unmount the provider and the page is back to its initial state. Mutations don't accumulate across plans.
