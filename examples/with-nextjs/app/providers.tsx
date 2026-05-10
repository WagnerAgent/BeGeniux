"use client";

import {
  BeGenProvider,
  createHttpAdapter,
  type DesignSystem,
} from "begeniux";

const designSystem: DesignSystem = {
  cssVariables: {
    "--begen-accent": {
      description: "Primary action color (CTAs, focus rings).",
      type: "color",
      defaultValue: "#7c3aed",
    },
    "--begen-density": {
      description:
        "Layout density (smaller value → tighter; larger → spacious).",
      type: "length",
      defaultValue: "16px",
    },
    "--begen-radius": {
      description: "Corner radius for surfaces (cards, buttons).",
      type: "length",
      defaultValue: "12px",
    },
  },
  classes: {
    "is-engaged":
      "Apply on document.documentElement when user is in fast/decisive mode.",
    "is-skimming":
      "Apply on document.documentElement when user is browsing slowly.",
    "is-frustrated":
      "Apply on document.documentElement when rage clicks or errors are detected.",
  },
};

const classify = createHttpAdapter({
  url: "/api/begen",
  timeoutMs: 10_000,
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BeGenProvider
      designSystem={designSystem}
      pageContext={{ route: "/" }}
      classify={classify}
      rateLimitMs={3000}
      triggerEveryEvents={3}
    >
      {children}
    </BeGenProvider>
  );
}
