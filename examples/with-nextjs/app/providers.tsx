"use client";

import {
  BeGenProvider,
  createHttpAdapter,
  type DesignSystem,
} from "begeniux";

const designSystem: DesignSystem = {
  cssVariables: {
    "--begen-accent": {
      description:
        "Primary action color (CTAs, focus rings). Switch to a warmer color (e.g. #ef4444) when the user looks frustrated.",
      type: "color",
      defaultValue: "#7c3aed",
    },
    "--begen-accent-soft": {
      description: "Softer variant of the accent for secondary buttons.",
      type: "color",
      defaultValue: "#a78bfa",
    },
    "--begen-density": {
      description:
        "Base padding/spacing. 10px is tight (decisive users), 16px balanced, 22px spacious (browsing).",
      type: "length",
      defaultValue: "16px",
    },
    "--begen-radius": {
      description:
        "Corner radius for cards, buttons. 6px sharp (decisive), 12px balanced, 18px soft.",
      type: "length",
      defaultValue: "12px",
    },
    "--begen-font-scale": {
      description:
        "Multiplies the base 16px html font-size. 0.95–1.1 reasonable range.",
      type: "number",
      range: [0.85, 1.2],
      defaultValue: "1",
    },
    "--begen-cta-scale": {
      description:
        "Scales CTA padding up/down. 0.95 minimal, 1 default, 1.1 emphasized for frustrated users.",
      type: "number",
      range: [0.9, 1.2],
      defaultValue: "1",
    },
    "--begen-card-bg": {
      description: "Card surface color.",
      type: "color",
      defaultValue: "#18181b",
    },
    "--begen-muted-opacity": {
      description:
        "Opacity of secondary text. 0.4 quiet, 0.6 balanced, 0.85 highly visible (helps frustrated users read everything).",
      type: "number",
      range: [0.4, 0.95],
      defaultValue: "0.6",
    },
  },
  classes: {
    "is-engaged":
      "Apply on document.documentElement when user is in fast/decisive mode (high clicks/min, low dwell, deep scroll).",
    "is-skimming":
      "Apply on document.documentElement when user is browsing slowly (low clicks/min, mid dwell, mid scroll).",
    "is-comparing":
      "Apply on document.documentElement when user is researching (high dwell, multi-target hovers, low clicks/min).",
    "is-frustrated":
      "Apply on document.documentElement when rage clicks or errors are detected.",
  },
};

const classify = createHttpAdapter({
  url: "/api/begen",
  timeoutMs: 15_000,
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BeGenProvider
      designSystem={designSystem}
      pageContext={{ route: "/" }}
      classify={classify}
      rateLimitMs={4000}
      triggerEveryEvents={3}
    >
      {children}
    </BeGenProvider>
  );
}
