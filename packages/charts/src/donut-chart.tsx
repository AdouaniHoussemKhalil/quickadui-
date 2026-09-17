"use client";

import { cn } from "@quickadui/utils";
import { type ComponentProps, useRef, useState } from "react";
import { ChartLegend } from "./chart-legend";
import { buildDonutSegments, describeDonutSegment, polarToCartesian } from "./chart-math";
import { ChartTooltip, TooltipRow, type TooltipState } from "./chart-tooltip";
import { getSeriesColor } from "./palette";

export interface DonutChartSegment {
  key: string;
  label: string;
  value: number;
  color?: string | undefined;
}

export interface DonutChartProps extends Omit<ComponentProps<"div">, "children"> {
  data: readonly DonutChartSegment[];
  /** `0` renders a pie (no hole); `0.6` (the default) renders a donut with a 60%-of-radius hole. */
  innerRadiusRatio?: number;
  /** Square size in CSS pixels — like the other charts, the `<svg>` itself scales to `100%` of its container via `viewBox`; this only sets the aspect ratio's base unit and the plot's own internal proportions. Default: `160`. */
  size?: number;
  valueFormatter?: ((value: number) => string) | undefined;
  /** Shown in the donut's hole (total of all `data[].value`) — has no effect when `innerRadiusRatio` is `0` (a pie has no hole to put it in). Default: `true`. */
  showTotal?: boolean;
}

const MIN_LABEL_FRACTION = 0.08; // below this, a direct % label would be a labeled sliver — see marks-and-anatomy.md's "measure first" rule

/**
 * A donut/pie chart — segments colored from the validated categorical
 * palette (`palette.ts`) in fixed order, a legend (segment count is
 * always >= 2 in practice), and — for up to 4 segments, per the
 * `dataviz` skill's "legend always present, <= 4 also direct-labeled"
 * rule — a direct percentage label on each large-enough wedge. Segments
 * are separated by a small literal angular gap (see `chart-math.ts`'s
 * `buildDonutSegments`), never a stroke drawn around them.
 */
export function DonutChart({
  data,
  innerRadiusRatio = 0.6,
  size = 160,
  valueFormatter = String,
  showTotal = true,
  className,
  ...props
}: DonutChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const cx = size / 2;
  const cy = size / 2;
  // Leaves room for the direct % labels just outside the ring (see below)
  // without clipping against the viewBox edge.
  const outerRadius = size / 2 - 20;
  const innerRadius = outerRadius * Math.max(0, Math.min(1, innerRadiusRatio));

  const total = data.reduce((sum, d) => sum + Math.max(0, d.value), 0);
  const resolved = data.map((d, i) => ({ ...d, color: d.color ?? getSeriesColor(i) }));
  const segments = buildDonutSegments(resolved.map((d) => d.value));
  const showDirectLabels = resolved.length <= 4;

  // Internal-only (`clientX`/`clientY`, never forwarded onward) — see
  // `bar-chart.tsx`'s identical comment on this same stub-fidelity pattern.
  function showTooltip(
    event: { clientX: number; clientY: number },
    content: TooltipState["content"],
  ) {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const rect = container.getBoundingClientRect();
    setTooltip({ x: event.clientX - rect.left, y: event.clientY - rect.top, content });
  }

  return (
    <div
      data-slot="donut-chart"
      className={cn("flex flex-col items-center gap-3", className)}
      {...props}
    >
      <div ref={containerRef} className="relative">
        <svg
          role="img"
          aria-label="Donut chart"
          viewBox={`0 0 ${size} ${size}`}
          width={size}
          height={size}
        >
          {resolved.map((segment, i) => {
            const angles = segments[i];
            if (!angles) {
              return null;
            }
            const d = describeDonutSegment(
              cx,
              cy,
              innerRadius,
              outerRadius,
              angles.startAngle,
              angles.endAngle,
            );
            const midAngle = (angles.startAngle + angles.endAngle) / 2;
            // Labeled just outside the ring, not inside the colored fill —
            // picking a text color that's always safe against an arbitrary
            // segment hue (without duplicating the CSS-variable colors as
            // literal hex just to compute contrast) is exactly the
            // "measure first" problem the `dataviz` skill warns about, so
            // this sidesteps it entirely: the label uses the same
            // `text-neutral-*` ink as everything else (never the data
            // color, per marks-and-anatomy.md), which is only guaranteed
            // legible against the chart's own surface, not against a
            // wedge.
            const labelPoint = polarToCartesian(cx, cy, outerRadius + 12, midAngle);
            const percent = total > 0 ? angles.fraction * 100 : 0;
            return (
              <g key={segment.key}>
                {d && (
                  <path
                    d={d}
                    fill={segment.color}
                    className="transition-opacity hover:opacity-80"
                    onPointerMove={(event: { clientX: number; clientY: number }) =>
                      showTooltip(
                        event,
                        <TooltipRow
                          color={segment.color}
                          label={`${segment.label} · ${percent.toFixed(0)}%`}
                          value={valueFormatter(segment.value)}
                        />,
                      )
                    }
                    onPointerLeave={() => setTooltip(null)}
                  />
                )}
                {showDirectLabels && angles.fraction >= MIN_LABEL_FRACTION && (
                  <text
                    x={labelPoint.x}
                    y={labelPoint.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-neutral-11 text-[10px] font-medium"
                  >
                    {percent.toFixed(0)}%
                  </text>
                )}
              </g>
            );
          })}
          {showTotal && innerRadiusRatio > 0 && (
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-neutral-12 text-sm font-semibold"
            >
              {valueFormatter(total)}
            </text>
          )}
        </svg>
        <ChartTooltip tooltip={tooltip} />
      </div>
      <ChartLegend items={resolved.map((d) => ({ key: d.key, label: d.label, color: d.color }))} />
    </div>
  );
}
