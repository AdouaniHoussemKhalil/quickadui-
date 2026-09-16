"use client";

import { cn } from "@quickadui/utils";
import type { ReactNode } from "react";

export interface TooltipState {
  /** Position in real screen pixels relative to the chart's own wrapping container (not SVG viewBox units) — see each chart component's pointer handler for how it's computed. */
  x: number;
  y: number;
  content: ReactNode;
}

/**
 * The shared hover/focus tooltip every chart in this package renders —
 * "tooltips enhance, they never gate" (per the `dataviz` skill's
 * `interaction.md`): every value shown here is also visible in the
 * legend/axis/direct labels, this is a convenience layer on top, not the
 * only way to read a value. Meant to sit as the last child of a
 * `position: relative` wrapper alongside the chart's own `<svg>`.
 */
export function ChartTooltip({ tooltip }: { tooltip: TooltipState | null }) {
  if (!tooltip) {
    return null;
  }
  return (
    <div
      role="tooltip"
      className={cn(
        "pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-neutral-6 bg-neutral-1 px-2.5 py-1.5 text-xs shadow-md",
      )}
      style={{ left: tooltip.x, top: tooltip.y - 10 }}
    >
      {tooltip.content}
    </div>
  );
}

export interface TooltipRowProps {
  /** The series/segment color, rendered as a short line-key — "line keys, not boxes" (`interaction.md`): a filled swatch is data-weight ink a stroke doesn't need. */
  color: string;
  label: ReactNode;
  /** Rendered first and visually stronger than `label` — "values lead, labels follow" once the reader is already in a tooltip (`interaction.md`); the legend outside keeps the opposite order. */
  value: ReactNode;
}

/** One row inside a `ChartTooltip`'s `content` — a chart with more than one series stacks several of these (see `LineChart`'s "one tooltip, every series" hover behavior). */
export function TooltipRow({ color, label, value }: TooltipRowProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span aria-hidden className="inline-block h-0.5 w-3 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <span className="font-medium text-neutral-12">{value}</span>
      <span className="text-neutral-10">{label}</span>
    </div>
  );
}
