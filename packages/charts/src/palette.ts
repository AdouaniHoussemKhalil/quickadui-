/**
 * The 8 categorical chart CSS variables, in the fixed order they're
 * validated in (see `chart-tokens.css`'s doc comment) — never reorder or
 * cycle these independently of each other, that's what keeps the
 * adjacent-pair color-vision-deficiency guarantee intact.
 */
export const CHART_SERIES_VARS = [
  "var(--qa-chart-series-1)",
  "var(--qa-chart-series-2)",
  "var(--qa-chart-series-3)",
  "var(--qa-chart-series-4)",
  "var(--qa-chart-series-5)",
  "var(--qa-chart-series-6)",
  "var(--qa-chart-series-7)",
  "var(--qa-chart-series-8)",
] as const;

/**
 * The single-hue default for a chart with exactly one series (`Sparkline`,
 * a single-series `BarChart`/`LineChart`) — QuickadUI's own brand accent,
 * not a slot from the categorical set above. A lone series needs no
 * legend and no CVD-separation guarantee (there's nothing to confuse it
 * with), so it's free to match the rest of the design system instead.
 */
export const CHART_ACCENT_VAR = "var(--qa-color-accent-9)";

/**
 * Resolves the categorical color for series index `i` (0-based). Beyond
 * the 8 validated slots this deliberately repeats the last slot rather
 * than inventing a 9th hue — see `chart-tokens.css`'s doc comment for why
 * (a generated 9th hue has no CVD guarantee against the other 8). Pass an
 * explicit `color` on that series instead once you have more than 8.
 */
export function getSeriesColor(i: number): string {
  const vars = CHART_SERIES_VARS;
  const last = vars[vars.length - 1] as string;
  return vars[i] ?? last;
}
