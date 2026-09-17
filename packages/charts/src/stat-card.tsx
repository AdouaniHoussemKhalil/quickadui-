"use client";

import { TrendDownIcon, TrendUpIcon } from "@quickadui/icons";
import { cn } from "@quickadui/utils";
import type { ComponentProps, ReactNode } from "react";

export interface StatCardTrend {
  direction: "up" | "down";
  /** e.g. `"+12%"`, `"-3.4 pts"` — pre-formatted, this component doesn't compute or sign it for you. */
  label: string;
}

export interface StatCardProps extends Omit<ComponentProps<"div">, "title"> {
  /** Sentence case, no trailing colon — see the `dataviz` skill's stat-tile contract. */
  label: string;
  /** Pre-formatted (e.g. `"2,431"`, `"$18.2K"`) — this component doesn't compute compact notation for you. */
  value: ReactNode;
  /** Rendered next to `label`, e.g. an icon from `@quickadui/icons`. */
  icon?: ReactNode | undefined;
  /**
   * Signed change vs. a named period, colored by direction using
   * QuickadUI's own `success`/`danger` tokens — the same colors
   * `@quickadui/core`'s `Alert` already uses for those states, so a
   * positive trend here reads as the same "good" as everywhere else in
   * the library. This assumes up is good and down is bad; for a metric
   * where that's inverted (e.g. "open tickets"), pick `direction`
   * accordingly rather than treating it as literally "value went up".
   */
  trend?: StatCardTrend | undefined;
  /** A `Sparkline` (or any other small trend visual) rendered below the value — see the stat-tile contract's optional `trend` sparkline. */
  children?: ReactNode | undefined;
}

/**
 * One dashboard metric: `label`, a large `value`, an optional colored
 * `trend` badge, and an optional embedded visual (`children`, typically a
 * `Sparkline`). Meant to be dropped inside a `@quickadui/shell` `Widget`
 * as its body, or used standalone anywhere a metric card is needed.
 */
export function StatCard({
  label,
  value,
  icon,
  trend,
  className,
  children,
  ...props
}: StatCardProps) {
  return (
    <div data-slot="stat-card" className={cn("flex flex-col gap-3", className)} {...props}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-neutral-11">{label}</span>
        {icon}
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="text-2xl font-semibold text-neutral-12">{value}</span>
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-sm font-medium",
              trend.direction === "up" ? "text-success-11" : "text-danger-11",
            )}
          >
            {trend.direction === "up" ? (
              <TrendUpIcon size={14} aria-hidden />
            ) : (
              <TrendDownIcon size={14} aria-hidden />
            )}
            {trend.label}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
