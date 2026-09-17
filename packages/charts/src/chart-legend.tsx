"use client";

import { cn } from "@quickadui/utils";
import type { ComponentProps } from "react";

export interface LegendItem {
  key: string;
  label: string;
  color: string;
}

export interface ChartLegendProps extends Omit<ComponentProps<"div">, "children"> {
  items: readonly LegendItem[];
}

/**
 * "A legend is always present for two or more series... a single series
 * needs no legend box" (`marks-and-anatomy.md`) — this renders nothing at
 * all for 0 or 1 items, so every chart in this package can render a
 * `ChartLegend` unconditionally and let it decide.
 */
export function ChartLegend({ items, className, ...props }: ChartLegendProps) {
  if (items.length < 2) {
    return null;
  }
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-neutral-11",
        className,
      )}
      {...props}
    >
      {items.map((item) => (
        <div key={item.key} className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block h-0.5 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
