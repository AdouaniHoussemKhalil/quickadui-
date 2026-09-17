/**
 * Pure numeric/geometry helpers shared by `Sparkline`/`BarChart`/
 * `LineChart`/`DonutChart` — deliberately free of React and SVG-string
 * concerns beyond returning plain numbers/strings, so they can be (and
 * are, see `chart-math.test.ts`) unit-tested directly, the same
 * "pull the logic out of the component and test it independently"
 * approach used for `@quickadui/shell`'s `WidgetGrid` reorder math.
 */

/** Maps `value` from `[domainMin, domainMax]` to `[rangeMin, rangeMax]`, clamping the domain's degenerate (zero-width) case to the range's midpoint instead of dividing by zero. */
export function linearScale(
  value: number,
  domainMin: number,
  domainMax: number,
  rangeMin: number,
  rangeMax: number,
): number {
  if (domainMax === domainMin) {
    return (rangeMin + rangeMax) / 2;
  }
  const t = (value - domainMin) / (domainMax - domainMin);
  return rangeMin + t * (rangeMax - rangeMin);
}

/**
 * Picks up to `maxTicks` "nice" (1/2/5 × a power of 10) round numbers
 * spanning `[min, max]`, ascending, always including a tick at or below
 * `min` and one at or above `max` — the y-axis gridline values described
 * in the `dataviz` skill's `marks-and-anatomy.md` ("round to clean
 * numbers (0 / 1,000 / 2,000)"). Returns `[0]` for the degenerate
 * `min === max === 0` case rather than dividing by zero.
 */
export function niceTicks(min: number, max: number, maxTicks = 5): number[] {
  if (min === max) {
    return [min];
  }
  const span = max - min;
  const rawStep = span / Math.max(1, maxTicks - 1);
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normalized = rawStep / magnitude;
  const niceNormalized = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  const step = niceNormalized * magnitude;

  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;

  const ticks: number[] = [];
  for (let v = start; v <= end + step / 2; v += step) {
    ticks.push(Math.round(v * 1e10) / 1e10); // strip float noise (e.g. 0.1 + 0.2)
  }
  return ticks;
}

export interface Point {
  x: number;
  y: number;
}

/** Builds an SVG `<path>` `d` attribute stringing `points` together with straight segments — used by `Sparkline` and `LineChart`. Returns `""` for fewer than 2 points (nothing to draw a line between). */
export function buildLinePath(points: readonly Point[]): string {
  if (points.length < 2) {
    return "";
  }
  const [first, ...rest] = points;
  const start = `M ${(first as Point).x} ${(first as Point).y}`;
  const segments = rest.map((p) => `L ${p.x} ${p.y}`);
  return [start, ...segments].join(" ");
}

/** Same as `buildLinePath`, but closed down to `baselineY` and back — the filled-area version of a line chart. */
export function buildAreaPath(points: readonly Point[], baselineY: number): string {
  if (points.length < 2) {
    return "";
  }
  const line = buildLinePath(points);
  const last = points[points.length - 1] as Point;
  const first = points[0] as Point;
  return `${line} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
}

export interface DonutSegment {
  /** Fraction of the whole this segment occupies, 0-1. */
  fraction: number;
  /** Start angle in degrees, 0 = 12 o'clock, clockwise. */
  startAngle: number;
  /** End angle in degrees (before the gap is applied). */
  endAngle: number;
}

/**
 * Splits non-negative `values` into proportional donut/pie angles
 * (0-360°, starting at 12 o'clock, clockwise) — negative or all-zero
 * input returns one segment per value at `fraction: 0` rather than
 * throwing or producing `NaN` angles. The small `gapDegrees` between
 * segments (see `marks-and-anatomy.md`'s "surface gap" spacer — realized
 * here as literal empty angle, not a stroke) is subtracted from each
 * segment's own span and is only applied when there's more than one
 * segment with a non-zero total.
 */
export function buildDonutSegments(values: readonly number[], gapDegrees = 2): DonutSegment[] {
  const safeValues = values.map((v) => Math.max(0, v));
  const total = safeValues.reduce((sum, v) => sum + v, 0);

  if (total <= 0) {
    return safeValues.map(() => ({ fraction: 0, startAngle: 0, endAngle: 0 }));
  }

  const effectiveGap = safeValues.length > 1 ? gapDegrees : 0;
  let cursor = 0;
  return safeValues.map((v) => {
    const fraction = v / total;
    const span = fraction * 360;
    const startAngle = cursor + effectiveGap / 2;
    const endAngle = cursor + span - effectiveGap / 2;
    cursor += span;
    return { fraction, startAngle, endAngle: Math.max(startAngle, endAngle) };
  });
}

/** A point on a circle of `radius` centered at `(cx, cy)`, at `angleDegrees` measured clockwise from 12 o'clock (SVG's `y` grows downward, hence the `sin`/`cos` swap vs. the usual trig convention). */
export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDegrees: number,
): Point {
  const rad = ((angleDegrees - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

/** Builds the SVG `<path>` `d` for one donut/pie ring segment between `innerRadius` (0 for a pie) and `outerRadius`, from `startAngle` to `endAngle` (degrees, 12 o'clock = 0, clockwise). Returns `""` for a zero-or-negative span (nothing to draw). */
export function describeDonutSegment(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
): string {
  if (endAngle <= startAngle) {
    return "";
  }
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle);

  if (innerRadius <= 0) {
    return [
      `M ${cx} ${cy}`,
      `L ${outerStart.x} ${outerStart.y}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
      `Z`,
    ].join(" ");
  }

  const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    `Z`,
  ].join(" ");
}
