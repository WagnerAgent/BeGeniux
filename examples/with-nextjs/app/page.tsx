"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useBeGenContext } from "begeniux";

// ─── Mock data ──────────────────────────────────────────────────────

type Product = {
  id: string;
  name: string;
  category: "shoes" | "bags" | "watches" | "accessories";
  price: string;
  rating: number;
  badge?: "new" | "sale" | "popular";
  image: string;
  reviews: { author: string; text: string }[];
};

const products: Product[] = [
  {
    id: "p-101",
    name: "Aurora Hoodie",
    category: "accessories",
    price: "$89",
    rating: 4.6,
    badge: "popular",
    image: "🧥",
    reviews: [
      { author: "alex", text: "Soft, fits true to size, amazing fabric." },
      { author: "sam", text: "Worth every penny. Wearing it every weekend." },
    ],
  },
  {
    id: "p-102",
    name: "Nimbus Sneakers",
    category: "shoes",
    price: "$129",
    rating: 4.8,
    badge: "new",
    image: "👟",
    reviews: [
      { author: "jess", text: "Light, comfortable for long days." },
      { author: "dani", text: "Look great with everything I own." },
    ],
  },
  {
    id: "p-103",
    name: "Cinder Tote",
    category: "bags",
    price: "$54",
    rating: 4.4,
    image: "👜",
    reviews: [
      { author: "ria", text: "Holds everything. Durable canvas." },
    ],
  },
  {
    id: "p-104",
    name: "Solstice Watch",
    category: "watches",
    price: "$249",
    rating: 4.9,
    badge: "popular",
    image: "⌚",
    reviews: [
      { author: "kai", text: "Premium build. Battery lasts forever." },
      { author: "noor", text: "Compliments every week." },
    ],
  },
  {
    id: "p-105",
    name: "Drift Cap",
    category: "accessories",
    price: "$32",
    rating: 4.3,
    badge: "sale",
    image: "🧢",
    reviews: [
      { author: "mo", text: "Great for sunny days." },
    ],
  },
  {
    id: "p-106",
    name: "Echo Headphones",
    category: "accessories",
    price: "$179",
    rating: 4.7,
    image: "🎧",
    reviews: [
      { author: "lee", text: "Sound is rich, ANC is solid." },
      { author: "tay", text: "Comfortable for 8h+ wear." },
    ],
  },
];

const categories = ["all", "shoes", "bags", "watches", "accessories"] as const;
type Category = (typeof categories)[number];

// ─── Page ───────────────────────────────────────────────────────────

export default function Home() {
  const [cart, setCart] = useState<string[]>([]);
  const [filter, setFilter] = useState<Category>("all");
  const [search, setSearch] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);

  const visible = useMemo(
    () =>
      products.filter((p) => {
        if (filter !== "all" && p.category !== filter) return false;
        if (search && !p.name.toLowerCase().includes(search.toLowerCase()))
          return false;
        return true;
      }),
    [filter, search],
  );

  return (
    <>
      <main
        className="mx-auto max-w-5xl"
        style={{ padding: "var(--begen-density)" }}
        data-begen-id="store"
      >
        <Header cartCount={cart.length} />
        <Hero search={search} onSearchChange={setSearch} />
        <FilterBar value={filter} onChange={setFilter} />

        <section
          data-begen-id="product-grid"
          className="grid"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "var(--begen-density)",
            marginTop: "calc(var(--begen-density) * 1.5)",
          }}
        >
          {visible.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onAdd={() => setCart((c) => [...c, p.id])}
            />
          ))}
          {visible.length === 0 && (
            <p className="muted col-span-full">
              No products match your filter — try clearing the search.
            </p>
          )}
        </section>

        <NewsletterForm />

        <DemoControls />

        {/* Bottom spacer so content doesn't sit under the sticky telemetry. */}
        <div aria-hidden style={{ height: 360 }} />
      </main>

      <Telemetry />
      <HelpFab open={helpOpen} onToggle={() => setHelpOpen((v) => !v)} />
    </>
  );
}

// ─── Subcomponents ──────────────────────────────────────────────────

function Header({ cartCount }: { cartCount: number }) {
  return (
    <header className="flex items-center justify-between mb-6">
      <div>
        <h1
          className="font-semibold"
          style={{ fontSize: "calc(1.6rem * var(--begen-font-scale))" }}
        >
          begeniux · live demo
        </h1>
        <p className="muted text-sm">
          Adaptive UI driven by your behavior. Click around — the agent retunes
          the design tokens in real time.
        </p>
      </div>
      <div
        data-begen-id="cart"
        className="text-sm muted"
        style={{ padding: "8px 12px" }}
      >
        🛒 {cartCount}
      </div>
    </header>
  );
}

function Hero({
  search,
  onSearchChange,
}: {
  search: string;
  onSearchChange: (v: string) => void;
}) {
  return (
    <section
      data-begen-id="hero"
      className="product-card mb-6"
      style={{ padding: "calc(var(--begen-density) * 1.5)" }}
    >
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <p className="text-sm muted mb-1 uppercase tracking-wider">
            Featured
          </p>
          <h2
            className="font-semibold"
            style={{ fontSize: "calc(1.4rem * var(--begen-font-scale))" }}
          >
            Find your next everyday item
          </h2>
        </div>
        <input
          data-begen-id="search-input"
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products…"
          className="bg-zinc-800 px-4 py-2 rounded-lg outline-none focus:ring-2"
          style={{
            borderRadius: "var(--begen-radius)",
            padding:
              "calc(var(--begen-density) * 0.5) calc(var(--begen-density) * 0.75)",
            minWidth: 220,
          }}
        />
      </div>
    </section>
  );
}

function FilterBar({
  value,
  onChange,
}: {
  value: Category;
  onChange: (v: Category) => void;
}) {
  return (
    <div
      data-begen-id="filters"
      className="flex flex-wrap gap-2"
      role="toolbar"
      aria-label="Filter by category"
    >
      {categories.map((c) => (
        <button
          key={c}
          data-begen-id={`filter-${c}`}
          aria-pressed={value === c}
          onClick={() => onChange(c)}
          className="chip capitalize"
        >
          {c}
        </button>
      ))}
    </div>
  );
}

function ProductCard({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: () => void;
}) {
  return (
    <article
      data-begen-id={product.id}
      className="product-card flex flex-col"
    >
      <div className="relative">
        <div
          className="text-5xl mb-2"
          aria-hidden
          data-begen-id={`${product.id}-image`}
        >
          {product.image}
        </div>
        {product.badge && (
          <span
            data-begen-id={`${product.id}-badge`}
            className="absolute top-0 right-0 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full"
            style={{
              background: "var(--begen-accent)",
              color: "white",
            }}
          >
            {product.badge}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-medium">{product.name}</h3>
        <span className="text-sm muted">★ {product.rating}</span>
      </div>
      <div
        className="font-semibold mb-3"
        data-begen-id={`${product.id}-price`}
        style={{ fontSize: "calc(1.1rem * var(--begen-font-scale))" }}
      >
        {product.price}
      </div>

      <div
        className="reviews-block muted"
        data-begen-id={`${product.id}-reviews`}
      >
        {product.reviews.map((r, i) => (
          <p key={i} className="leading-snug">
            <strong className="opacity-100">{r.author}:</strong> {r.text}
          </p>
        ))}
      </div>

      <div className="flex gap-2 mt-auto pt-3">
        <button
          data-begen-id="cta"
          onClick={onAdd}
          className="cta flex-1"
        >
          Add to cart
        </button>
        <button
          data-begen-id={`${product.id}-favorite`}
          aria-label="Save for later"
          className="cta cta-secondary"
          style={{ padding: "calc(var(--begen-density) * 0.5)" }}
        >
          ♡
        </button>
      </div>
    </article>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "error" | "ok">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  return (
    <section
      data-begen-id="newsletter"
      className="product-card mt-10"
      style={{ padding: "calc(var(--begen-density) * 1.5)" }}
    >
      <h2
        className="font-semibold mb-2"
        style={{ fontSize: "calc(1.2rem * var(--begen-font-scale))" }}
      >
        Stay in the loop
      </h2>
      <p className="muted text-sm mb-4">
        Drop your email — we'll let you know when new drops land.
      </p>
      <form
        className="flex gap-2 flex-wrap"
        onSubmit={(e) => {
          e.preventDefault();
          setState("submitting");
          if (!email.includes("@")) {
            // Throw a real Error so the begeniux tracker captures it as
            // an `error` event — the agent should respond by emphasizing
            // help / form clarity.
            window.setTimeout(() => {
              try {
                throw new Error("Newsletter: invalid email format");
              } catch (err) {
                window.dispatchEvent(
                  new ErrorEvent("error", {
                    message: (err as Error).message,
                    error: err,
                  }),
                );
                setErrorMsg(
                  "That email looks off — make sure it has an @ and a domain.",
                );
                setState("error");
              }
            }, 200);
            return;
          }
          window.setTimeout(() => {
            setState("ok");
            setEmail("");
          }, 400);
        }}
      >
        <input
          data-begen-id="newsletter-email"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-invalid={state === "error"}
          className="bg-zinc-800 outline-none flex-1"
          style={{
            borderRadius: "var(--begen-radius)",
            padding:
              "calc(var(--begen-density) * 0.5) calc(var(--begen-density) * 0.75)",
            minWidth: 220,
          }}
        />
        <button
          data-begen-id="newsletter-submit"
          type="submit"
          className="cta"
          disabled={state === "submitting"}
        >
          {state === "submitting" ? "Sending…" : "Subscribe"}
        </button>
      </form>
      {state === "error" && (
        <p
          data-begen-id="newsletter-error"
          role="alert"
          className="mt-2 text-sm"
          style={{ color: "#fca5a5" }}
        >
          {errorMsg}
        </p>
      )}
      {state === "ok" && (
        <p className="mt-2 text-sm" style={{ color: "#86efac" }}>
          ✓ Subscribed. Check your inbox.
        </p>
      )}
    </section>
  );
}

function HelpFab({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="fixed right-4 z-50 flex flex-col items-end gap-2"
      style={{ bottom: "calc(var(--begen-telemetry-h, 64px) + 16px)" }}
    >
      {open && (
        <div
          className="product-card max-w-xs text-sm"
          style={{ padding: "var(--begen-density)" }}
          role="dialog"
          aria-label="Help"
        >
          <p className="font-medium mb-1">Need a hand?</p>
          <p className="muted">
            Try clicking products you're interested in. Hover them to see
            reviews. Use the search bar above. The agent watches and adjusts.
          </p>
        </div>
      )}
      <button
        data-begen-id="help-trigger"
        aria-label="Help"
        onClick={onToggle}
        className="cta"
        style={{ borderRadius: "999px", width: 48, height: 48, padding: 0 }}
      >
        ?
      </button>
    </div>
  );
}

function DemoControls() {
  const ctaSelector = '[data-begen-id="cta"]';
  const helpSelector = '[data-begen-id="help-trigger"]';

  const fire = (selector: string, count: number, intervalMs = 80) => {
    let i = 0;
    const tick = () => {
      const els = document.querySelectorAll<HTMLElement>(selector);
      const target = els[Math.floor(Math.random() * Math.max(1, els.length))];
      target?.click();
      i++;
      if (i < count) window.setTimeout(tick, intervalMs);
    };
    tick();
  };

  return (
    <section
      data-begen-id="demo-controls"
      className="product-card mt-10"
      style={{ padding: "var(--begen-density)" }}
    >
      <p className="text-sm muted uppercase tracking-wider mb-3">
        Demo · simulate behavior patterns
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          className="cta cta-secondary"
          onClick={() => fire(ctaSelector, 12, 60)}
          title="12 fast clicks across CTAs in ~700ms — high clicks/min, low dwell"
        >
          ⚡ Simulate decisive shopper
        </button>
        <button
          className="cta cta-secondary"
          onClick={() => fire(helpSelector, 6, 80)}
          title="6 rapid clicks on the same target — triggers rage-click detection"
        >
          😤 Simulate frustrated user
        </button>
        <button
          className="cta cta-secondary"
          onClick={() => {
            // Hover-spam multiple products to trigger comparing pattern
            const targets = document.querySelectorAll<HTMLElement>(
              '[data-begen-id^="p-1"][data-begen-id$="-image"]',
            );
            targets.forEach((el, i) => {
              window.setTimeout(() => {
                el.dispatchEvent(
                  new MouseEvent("mouseover", { bubbles: true }),
                );
                window.setTimeout(() => {
                  el.dispatchEvent(
                    new MouseEvent("mouseout", { bubbles: true }),
                  );
                }, 600);
              }, i * 250);
            });
          }}
          title="Hover across product images to push hover_count up and avg_dwell"
        >
          🔍 Simulate comparing
        </button>
        <button
          className="cta cta-secondary"
          onClick={() => {
            window.dispatchEvent(
              new ErrorEvent("error", {
                message: "demo: simulated runtime error",
                error: new Error("demo: simulated runtime error"),
              }),
            );
          }}
          title="Dispatch a window error event — bumps errors_seen"
        >
          ⚠️ Simulate error
        </button>
      </div>
      <p className="text-xs muted mt-3">
        These shortcuts fire real events on the existing DOM, so the tracker
        sees them the same way it would see a human user. Watch the telemetry
        below — once a pattern crosses the threshold, the agent runs and the
        UI shifts.
      </p>
    </section>
  );
}

function Telemetry() {
  const { summary, lastPlan, appliedAdaptations } = useBeGenContext();
  const lastClass = useActiveAdaptiveClasses();
  const [open, setOpen] = useState(true);

  return (
    <aside
      role="complementary"
      aria-label="begeniux telemetry"
      className="fixed bottom-0 left-0 right-0 z-40 font-mono text-xs"
      style={{
        background: "rgba(15, 16, 20, 0.92)",
        backdropFilter: "saturate(140%) blur(10px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        className="mx-auto max-w-5xl"
        style={{ padding: "10px var(--begen-density)" }}
      >
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between"
          aria-expanded={open}
        >
          <span className="muted uppercase tracking-wider text-[10px]">
            Telemetry · live agent state
          </span>
          <span className="flex items-center gap-3">
            {lastClass && (
              <span
                className="px-2 py-0.5 rounded-full text-[10px]"
                style={{
                  background: "rgba(167, 139, 250, 0.18)",
                  border: "1px solid var(--begen-accent-soft)",
                }}
              >
                .{lastClass}
              </span>
            )}
            <span className="muted">
              {summary?.events_seen ?? 0} events ·{" "}
              {appliedAdaptations.length} applied
            </span>
            <span className="opacity-60">{open ? "▾" : "▸"}</span>
          </span>
        </button>

        {open && (
          <div className="mt-3">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-1">
              <Stat label="events seen" v={summary?.events_seen ?? 0} />
              <Stat label="clicks/min" v={summary?.clicks_per_min ?? 0} />
              <Stat label="rage clicks" v={summary?.rage_clicks ?? 0} />
              <Stat label="hovers" v={summary?.hover_count ?? 0} />
              <Stat
                label="avg dwell ms"
                v={summary?.avg_dwell_ms ?? 0}
              />
              <Stat
                label="scroll"
                v={(summary?.scroll_depth ?? 0).toFixed(2)}
              />
              <Stat
                label="form interactions"
                v={summary?.form_interactions ?? 0}
              />
              <Stat label="errors" v={summary?.errors_seen ?? 0} />
              <Stat
                label="viewport"
                v={`${summary?.viewport.width ?? 0}×${summary?.viewport.height ?? 0}`}
              />
            </div>

            {lastPlan && (
              <div className="mt-3 pt-3 border-t border-zinc-800">
                <div className="flex flex-wrap gap-x-6 gap-y-1">
                  <span>
                    <span className="muted">confidence:</span>{" "}
                    {lastPlan.confidence.toFixed(2)}
                  </span>
                  <span>
                    <span className="muted">applied:</span>{" "}
                    {appliedAdaptations.length} mutation(s)
                  </span>
                </div>
                <div className="mt-1">
                  <span className="muted">reasoning:</span>{" "}
                  <span className="opacity-100">
                    {lastPlan.reasoning}
                  </span>
                </div>
                {appliedAdaptations.length > 0 && (
                  <ul
                    className="mt-2 space-y-0.5 max-h-32 overflow-auto pr-2"
                    style={{ scrollbarWidth: "thin" }}
                  >
                    {appliedAdaptations.slice(0, 12).map((a, i) => (
                      <li key={i} className="opacity-90">
                        <span className="muted">{a.kind}</span>{" "}
                        <span className="opacity-100">{a.selector}</span>{" "}
                        {"name" in a && (
                          <span className="muted">→ {a.name}</span>
                        )}
                        {"className" in a && (
                          <span className="muted">→ .{a.className}</span>
                        )}
                        {"value" in a && (
                          <span className="muted">
                            = {String(a.value)}
                          </span>
                        )}
                        {"property" in a && (
                          <span className="muted">→ {a.property}</span>
                        )}
                      </li>
                    ))}
                    {appliedAdaptations.length > 12 && (
                      <li className="muted">
                        …{appliedAdaptations.length - 12} more
                      </li>
                    )}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
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

// Reads the current adaptive class on <html> so the telemetry can show
// which mode the agent has put us in. Pure observation.
function useActiveAdaptiveClasses() {
  const [cls, setCls] = useState<string | null>(null);
  useEffect(() => {
    const el = document.documentElement;
    const KNOWN = ["is-engaged", "is-skimming", "is-comparing", "is-frustrated"];
    const read = () => {
      const found = KNOWN.find((k) => el.classList.contains(k));
      setCls(found ?? null);
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  return cls;
}
