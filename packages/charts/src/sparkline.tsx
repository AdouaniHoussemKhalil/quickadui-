"use client";

import { cn } from "@quickadui/utils";
import type { ComponentProps } from "react";
import { buildAreaPath, buildLinePath, linearScale } from "./chart-math";
import { CHART_ACCENT_VAR } from "./palette";

export interface SparklineProps
  extends Omit<ComponentProps<"svg">, "width" | "height" | "children"> {
  data: readonly number[];
  /** Defaults to QuickadUI's brand accent — a sparkline is always a single series, so it never needs the categorical palette (see `palette.ts`). */
  color?: string;
  strokeWidth?: number;
  /** Fills under the line at ~10% opacity — a wash, per the `dataviz` skill's mark spec, never a saturated block. */
  area?: boolean;
  width?: number;
  height?: number;
}

const DEFAULT_WIDTH = 96;
const DEFAULT_HEIGHT = 32;

/**
 * A minimal inline trend line with no axes, gridlines, or legend — meant
 * to live inside a `StatCard` or a narrow `Widget`, not to stand alone as
 * a full chart (see `LineChart` for that). Single series only, by design.
 */
export function Sparkline({
  data,
  color = CHART_ACCENT_VAR,
  strokeWidth = 2,
  area = false,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  className,
  ...props
}: SparklineProps) {
  const values = data.length > 0 ? data : [0];
  const min = Math.min(...values);
  const max = Math.max(...values);
  // Keeps the line's own stroke from clipping against the viewBox edge at
  // the very top/bottom of its range.
  const inset = strokeWidth;
  const points = values.map((v, i) => ({
    x: linearScale(i, 0, Math.max(1, values.length - 1), 0, width),
    y: linearScale(v, min, max, height - inset, inset),
  }));
  const linePath = buildLinePath(points);
  const areaPath = area ? buildAreaPath(points, height) : "";

  return (
    <svg
      role="img"
      aria-label="Trend sparkline"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn("overflow-visible", className)}
      {...props}
    >
      {area && areaPath && <path d={areaPath} fill={color} fillOpacity={0.1} stroke="none" />}
      {linePath && (
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
