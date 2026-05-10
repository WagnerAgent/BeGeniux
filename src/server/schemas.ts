import { z } from "zod";

// Zod schemas mirroring src/types.ts. Used for both input validation in the
// HTTP handler and the structured output the LLM emits via the
// `apply_adaptations` tool.

export const adaptationSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("set-css-var"),
    selector: z.string(),
    name: z.string(),
    value: z.string(),
  }),
  z.object({
    kind: z.literal("add-class"),
    selector: z.string(),
    className: z.string(),
  }),
  z.object({
    kind: z.literal("remove-class"),
    selector: z.string(),
    className: z.string(),
  }),
  z.object({
    kind: z.literal("set-style"),
    selector: z.string(),
    property: z.string(),
    value: z.string(),
  }),
  z.object({
    kind: z.literal("set-attribute"),
    selector: z.string(),
    name: z.string(),
    value: z.string(),
  }),
  z.object({
    kind: z.literal("set-aria-label"),
    selector: z.string(),
    value: z.string(),
  }),
]);

export const adaptationPlanSchema = z.object({
  adaptations: z.array(adaptationSchema),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});

export const behaviorSummarySchema = z.object({
  clicks_per_min: z.number(),
  rage_clicks: z.number(),
  avg_dwell_ms: z.number(),
  scroll_depth: z.number(),
  hover_count: z.number(),
  form_interactions: z.number(),
  errors_seen: z.number(),
  events_seen: z.number(),
  viewport: z.object({ width: z.number(), height: z.number() }),
  custom: z.record(z.union([z.number(), z.string(), z.boolean()])),
  page_context: z.record(z.unknown()),
});

export const designSystemSchema = z.object({
  cssVariables: z.record(z.unknown()).optional(),
  classes: z.record(z.string()).optional(),
  examples: z.array(adaptationPlanSchema).optional(),
});

export const adaptInputSchema = z.object({
  summary: behaviorSummarySchema,
  designSystem: designSystemSchema,
  dom: z.object({
    visibleSelectors: z.array(z.string()),
    route: z.string(),
  }),
});

export type ValidatedAdaptInput = z.infer<typeof adaptInputSchema>;
export type ValidatedAdaptationPlan = z.infer<typeof adaptationPlanSchema>;
