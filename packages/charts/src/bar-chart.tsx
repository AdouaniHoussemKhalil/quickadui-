"use client";

import { cn } from "@quickadui/utils";
import { type ComponentProps, useRef, useState } from "react";
import { ChartLegend } from "./chart-legend";
import { linearScale, niceTicks } from "./chart-math";
import { ChartTooltip, TooltipRow, type TooltipState } from "./chart-tooltip";
import { CHART_ACCENT_VAR, getSeriesColor } from "./palette";

export interface BarChartSeries {
  key: string;
  label: string;
  color?: string | undefined;
}

export interface BarChartProps extends Omit<ComponentProps<"div">, "children"> {
  /** One row per category — each row must have a value under every `series[].key`, plus `categoryKey`. */
  data: readonly Record<string, string | number>[];
  categoryKey: string;
  series: readonly BarChartSeries[];
  /** Plot height in CSS pixels — width is always 100% of the container (a `viewBox`-scaled `<svg>`, no `ResizeObserver` involved). Default: `240`. */
  height?: number;
  valueFormatter?: ((value: number) => string) | undefined;
}

const CHART_WIDTH = 480;
const PADDING = { top: 12, right: 12, bottom: 28, left: 40 } as const;
const MAX_BAR_THICKNESS = 24; // marks-and-anatomy.md: "<= 24px thick ... never fill the slot"
const BAR_GAP = 2; // marks-and-anatomy.md's "surface gap" spacer

/**
 * A grouped vertical bar chart — one or more `series` per category, each
 * bar independently hoverable/focusable (its own tooltip showing category
 * + value, per the `dataviz` skill's "the mark is the hit target" rule),
 * with a legend once there's more than one series. Single-series charts
 * default to QuickadUI's brand accent; multi-series charts default to the
 * validated categorical palette in `palette.ts`, assigned in fixed order.
 */
export function BarChart({ data, categoryKey, series, height = 240, valueFormatter = String, className, ...props }: BarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const plotHeight = height - PADDING.top - PADDING.bottom;

  const resolvedSeries = series.map((s, i) => ({
    ...s,
    color: s.color ?? (series.length <= 1 ? CHART_ACCENT_VAR : getSeriesColor(i)),
  }));

  const allValues = data.flatMap((row) => resolvedSeries.map((s) => Number(row[s.key] ?? 0)));
  const maxValue = allValues.length > 0 ? Math.max(0, ...allValues) : 0;
  const ticks = niceTicks(0, maxValue, 4);
  const domainMax = ticks[ticks.length - 1] ?? Math.max(maxValue, 1);

  const groupWidth = data.length > 0 ? plotWidth / data.length : plotWidth;
  const barThickness = Math.max(
    1,
    Math.min(MAX_BAR_THICKNESS, (groupWidth - BAR_GAP * (resolvedSeries.length + 1)) / Math.max(1, resolvedSeries.length)),
  );
  const groupContentWidth = barThickness * resolvedSeries.length + BAR_GAP * (resolvedSeries.length - 1);
  const groupStartOffset = (groupWidth - groupContentWidth) / 2;

  // Consumed only internally (`clientX`/`clientY`, never forwarded to
  // another prop's real event-handler type) — a minimal structural type
  // is correct and safe here, same reasoning as `@quickadui/data`'s
  // `tree-view.tsx` and `@quickadui/shell`'s `DashboardDemo.tsx` usage,
  // NOT `SidebarTrigger`'s `any` case (which forwards its event onward).
  function showTooltip(event: { clientX: number; clientY: number }, content: TooltipState["content"]) {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const rect = container.getBoundingClientRect();
    setTooltip({ x: event.clientX - rect.left, y: event.clientY - rect.top, content });
  }

  return (
    <div data-slot="bar-chart" className={cn("flex flex-col gap-3", className)} {...props}>
      <div ref={containerRef} className="relative">
        <svg role="img" aria-label="Bar chart" viewBox={`0 0 ${CHART_WIDTH} ${height}`} width="100%" height={height}>
          <g transform={`translate(${PADDING.left}, ${PADDING.top})`}>
            {ticks.map((tick) => {
              const y = linearScale(tick, 0, domainMax, plotHeight, 0);
              return (
                <g key={tick}>
                  <line x1={0} x2={plotWidth} y1={y} y2={y} className="stroke-neutral-6" strokeWidth={1} />
                  <text x={-8} y={y} textAnchor="end" dominantBaseline="middle" className="fill-neutral-9 text-[10px]">
                    {valueFormatter(tick)}
                  </text>
                </g>
              );
            })}
            {data.map((row, groupIndex) => {
              const category = String(row[categoryKey] ?? "");
              const groupX = groupIndex * groupWidth + groupStartOffset;
              return (
                <g key={category || groupIndex}>
                  {resolvedSeries.map((s, seriesIndex) => {
                    const rawValue = Number(row[s.key] ?? 0);
                    const barHeight = Math.max(0, linearScale(rawValue, 0, domainMax, 0, plotHeight));
                    const x = groupX + seriesIndex * (barThickness + BAR_GAP);
                    const y = plotHeight - barHeight;
                    return (
                      <rect
                        key={s.key}
                        x={x}
                        y={y}
                        width={barThickness}
                        height={barHeight}
                        rx={4}
                        fill={s.color}
                        className="transition-opacity hover:opacity-80"
                        onPointerMove={(event: { clientX: number; clientY: number }) =>
                          showTooltip(event, <TooltipRow color={s.color} label={`${category} · ${s.label}`} value={valueFormatter(rawValue)} />)
                        }
                        onPointerLeave={() => setTooltip(null)}
                      />
                    );
                  })}
                  <text x={groupX + groupContentWidth / 2} y={plotHeight + 16} textAnchor="middle" className="fill-neutral-9 text-[10px]">
                    {category}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
        <ChartTooltip tooltip={tooltip} />
      </div>
      <ChartLegend items={resolvedSeries.map((s) => ({ key: s.key, label: s.label, color: s.color }))} />
    </div>
  );
}
