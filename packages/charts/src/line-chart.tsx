"use client";

import { cn } from "@quickadui/utils";
import { type ComponentProps, useRef, useState } from "react";
import { ChartLegend } from "./chart-legend";
import { buildAreaPath, buildLinePath, linearScale, niceTicks } from "./chart-math";
import { ChartTooltip, TooltipRow, type TooltipState } from "./chart-tooltip";
import { CHART_ACCENT_VAR, getSeriesColor } from "./palette";

export interface LineChartSeries {
  key: string;
  label: string;
  color?: string | undefined;
}

export interface LineChartProps extends Omit<ComponentProps<"div">, "children"> {
  data: readonly Record<string, string | number>[];
  categoryKey: string;
  series: readonly LineChartSeries[];
  /** Fills under each line at ~10% opacity — a wash, per the `dataviz` skill's mark spec. Default: `false`. */
  area?: boolean;
  height?: number;
  valueFormatter?: ((value: number) => string) | undefined;
}

const CHART_WIDTH = 480;
const PADDING = { top: 12, right: 12, bottom: 28, left: 40 } as const;

/**
 * A multi-series line chart with a pointer-following crosshair — "the
 * crosshair finds the X... one tooltip, every series" (`dataviz`
 * skill's `interaction.md`): hovering anywhere over the plot snaps a
 * vertical hairline to the nearest category and shows every series'
 * value at that position in one shared tooltip, rather than requiring
 * the pointer to land exactly on a line. Single-series charts default to
 * QuickadUI's brand accent; multi-series charts default to the validated
 * categorical palette in `palette.ts`.
 */
export function LineChart({ data, categoryKey, series, area = false, height = 240, valueFormatter = String, className, ...props }: LineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

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
  const lastIndex = Math.max(0, data.length - 1);

  const xForIndex = (i: number) => linearScale(i, 0, lastIndex, 0, plotWidth);
  const yForValue = (v: number) => linearScale(v, 0, domainMax, plotHeight, 0);

  const seriesPoints = resolvedSeries.map((s) => ({
    series: s,
    points: data.map((row, i) => ({ x: xForIndex(i), y: yForValue(Number(row[s.key] ?? 0)) })),
  }));

  // Internal-only (`clientX`, never forwarded onward) — see `bar-chart.tsx`'s
  // identical comment on this same stub-fidelity pattern.
  function handlePointerMove(event: { clientX: number }) {
    const container = containerRef.current;
    if (!container || data.length === 0) {
      return;
    }
    const rect = container.getBoundingClientRect();
    const scaleFactor = rect.width > 0 ? CHART_WIDTH / rect.width : 1;
    const localX = (event.clientX - rect.left) * scaleFactor - PADDING.left;
    const index = Math.round(linearScale(localX, 0, plotWidth, 0, lastIndex));
    setHoverIndex(Math.min(lastIndex, Math.max(0, index)));
  }

  const hoveredRow = hoverIndex === null ? null : data[hoverIndex];
  const crosshairX = hoverIndex === null ? null : xForIndex(hoverIndex);

  const tooltip: TooltipState | null =
    hoverIndex === null || crosshairX === null || !hoveredRow
      ? null
      : {
          x: PADDING.left + crosshairX,
          y: PADDING.top,
          content: (
            <div className="flex flex-col gap-1">
              <div className="font-medium text-neutral-12">{String(hoveredRow[categoryKey] ?? "")}</div>
              {seriesPoints.map(({ series: s }) => (
                <TooltipRow key={s.key} color={s.color} label={s.label} value={valueFormatter(Number(hoveredRow[s.key] ?? 0))} />
              ))}
            </div>
          ),
        };

  return (
    <div data-slot="line-chart" className={cn("flex flex-col gap-3", className)} {...props}>
      <div ref={containerRef} className="relative">
        <svg role="img" aria-label="Line chart" viewBox={`0 0 ${CHART_WIDTH} ${height}`} width="100%" height={height}>
          <g transform={`translate(${PADDING.left}, ${PADDING.top})`}>
            {ticks.map((tick) => {
              const y = yForValue(tick);
              return (
                <g key={tick}>
                  <line x1={0} x2={plotWidth} y1={y} y2={y} className="stroke-neutral-6" strokeWidth={1} />
                  <text x={-8} y={y} textAnchor="end" dominantBaseline="middle" className="fill-neutral-9 text-[10px]">
                    {valueFormatter(tick)}
                  </text>
                </g>
              );
            })}

            {seriesPoints.map(({ series: s, points }) => (
              <g key={s.key}>
                {area && <path d={buildAreaPath(points, plotHeight)} fill={s.color} fillOpacity={0.1} stroke="none" />}
                <path d={buildLinePath(points)} fill="none" stroke={s.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                {points.map((p, i) => (
                  <circle
                    // biome-ignore lint/suspicious/noArrayIndexKey: points are positional samples, not identity-bearing records
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={4}
                    fill={s.color}
                    className="stroke-neutral-1"
                    strokeWidth={2}
                  />
                ))}
              </g>
            ))}

            {crosshairX !== null && <line x1={crosshairX} x2={crosshairX} y1={0} y2={plotHeight} className="stroke-neutral-7" strokeWidth={1} />}

            {data.map((row, i) => (
              <text
                // biome-ignore lint/suspicious/noArrayIndexKey: categories are positional samples, duplicate labels are valid
                key={i}
                x={xForIndex(i)}
                y={plotHeight + 16}
                textAnchor="middle"
                className="fill-neutral-9 text-[10px]"
              >
                {String(row[categoryKey] ?? "")}
              </text>
            ))}

            <rect
              x={0}
              y={0}
              width={plotWidth}
              height={plotHeight}
              fill="transparent"
              onPointerMove={handlePointerMove}
              onPointerLeave={() => setHoverIndex(null)}
            />
          </g>
        </svg>
        <ChartTooltip tooltip={tooltip} />
      </div>
      <ChartLegend items={resolvedSeries.map((s) => ({ key: s.key, label: s.label, color: s.color }))} />
    </div>
  );
}
