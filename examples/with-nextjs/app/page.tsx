"use client";

import { useState } from "react";
import { useBeGenContext } from "begeniux";

const products = [
  {
    id: "p-101",
    name: "Aurora Hoodie",
    price: "$89",
    rating: 4.6,
    image: "🧥",
  },
  {
    id: "p-102",
    name: "Nimbus Sneakers",
    price: "$129",
    rating: 4.8,
    image: "👟",
  },
  {
    id: "p-103",
    name: "Cinder Tote",
    price: "$54",
    rating: 4.4,
    image: "👜",
  },
  {
    id: "p-104",
    name: "Solstice Watch",
    price: "$249",
    rating: 4.9,
    image: "⌚",
  },
  {
    id: "p-105",
    name: "Drift Cap",
    price: "$32",
    rating: 4.3,
    image: "🧢",
  },
  {
    id: "p-106",
    name: "Echo Headphones",
    price: "$179",
    rating: 4.7,
    image: "🎧",
  },
];

export default function Home() {
  const [cart, setCart] = useState<string[]>([]);

  return (
    <main
      className="mx-auto max-w-5xl"
      style={{ padding: "var(--begen-density)" }}
      data-begen-id="store"
    >
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">begeniux · live demo</h1>
        <div className="text-sm opacity-60" data-begen-id="cart-count">
          {cart.length} in cart
        </div>
      </header>

      <p className="opacity-70 mb-6 text-sm">
        Click around. Hover products. Scroll. Rage-click. The agent is
        watching the trace and asking Gemini to retune CSS variables in
        real time. No reload — DOM mutates live.
      </p>

      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "var(--begen-density)",
        }}
        data-begen-id="product-grid"
      >
        {products.map((p) => (
          <article
            key={p.id}
            data-begen-id={p.id}
            className="bg-zinc-900"
            style={{
              padding: "var(--begen-density)",
              borderRadius: "var(--begen-radius)",
              transition:
                "padding 200ms ease, border-radius 200ms ease, background 200ms ease",
            }}
          >
            <div
              className="text-5xl mb-2"
              aria-hidden
              data-begen-id={`${p.id}-image`}
            >
              {p.image}
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-medium">{p.name}</h3>
              <span className="text-sm opacity-60">★ {p.rating}</span>
            </div>
            <div
              className="text-lg font-semibold mb-3"
              data-begen-id={`${p.id}-price`}
            >
              {p.price}
            </div>
            <button
              data-begen-id="cta"
              onClick={() => setCart((prev) => [...prev, p.id])}
              className="w-full font-semibold text-white"
              style={{
                background: "var(--begen-accent)",
                padding:
                  "calc(var(--begen-density) * 0.6) var(--begen-density)",
                borderRadius: "var(--begen-radius)",
                transition:
                  "background 200ms ease, padding 200ms ease, border-radius 200ms ease",
              }}
            >
              Add to cart
            </button>
          </article>
        ))}
      </div>

      <Telemetry />
    </main>
  );
}

function Telemetry() {
  const { summary, lastPlan, appliedAdaptations } = useBeGenContext();

  return (
    <details
      className="mt-10 bg-zinc-900 rounded-lg p-4 text-xs font-mono opacity-80"
      open
    >
      <summary className="cursor-pointer mb-3 opacity-70 uppercase tracking-wider text-[10px]">
        Telemetry · live agent state
      </summary>
      <div className="grid grid-cols-2 gap-x-8 gap-y-1">
        <Stat label="events seen" v={summary?.events_seen ?? 0} />
        <Stat label="clicks/min" v={summary?.clicks_per_min ?? 0} />
        <Stat label="rage clicks" v={summary?.rage_clicks ?? 0} />
        <Stat label="hovers" v={summary?.hover_count ?? 0} />
        <Stat label="avg dwell ms" v={summary?.avg_dwell_ms ?? 0} />
        <Stat
          label="scroll"
          v={(summary?.scroll_depth ?? 0).toFixed(2)}
        />
        <Stat label="form interactions" v={summary?.form_interactions ?? 0} />
        <Stat label="errors" v={summary?.errors_seen ?? 0} />
      </div>
      {lastPlan && (
        <div className="mt-4 pt-3 border-t border-zinc-800">
          <div className="opacity-70 mb-1">Last plan</div>
          <div>
            confidence:{" "}
            <span className="opacity-100">
              {lastPlan.confidence.toFixed(2)}
            </span>
          </div>
          <div className="mt-1">
            reasoning:{" "}
            <span className="opacity-100">{lastPlan.reasoning}</span>
          </div>
          <div className="mt-1">
            applied:{" "}
            <span className="opacity-100">
              {appliedAdaptations.length} mutation(s)
            </span>
          </div>
        </div>
      )}
    </details>
  );
}

function Stat({ label, v }: { label: string; v: string | number }) {
  return (
    <div className="flex justify-between">
      <span className="opacity-50">{label}</span>
      <span>{v}</span>
    </div>
  );
}
