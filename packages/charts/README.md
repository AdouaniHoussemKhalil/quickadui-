# @quickadui/charts

Ready-to-use dashboard stat and chart components: `StatCard`, `Sparkline`,
`BarChart`, `LineChart`, `DonutChart`. Every mark is hand-rolled SVG —
**zero charting-library dependency** — following the form, color, mark,
and interaction rules from Anthropic's `dataviz` skill (fixed categorical
hue order validated for color-vision-deficiency separation, thin marks
with rounded data-ends, a hover tooltip on every chart, a legend for 2+
series, direct labels used sparingly).

> Pairs naturally with `@quickadui/shell`'s `Widget`/`WidgetGrid` (drop
> any component here inside a `Widget` as its body) but doesn't depend on
> it — every component here also works standalone, anywhere in a
> QuickadUI app.

## Setup

Besides the usual `@quickadui/theme` CSS imports every QuickadUI app
already has, this package ships **one more required CSS file** — its own
categorical chart palette, a separate concern from the brand/semantic
design tokens (see "Why a separate palette?" below):

```css
@import "@quickadui/theme/tokens.css";
@import "@quickadui/theme/tailwind-theme.css";
@import "@quickadui/charts/chart-tokens.css";

@source "<path-to>/node_modules/@quickadui/charts";
```

(Monorepo consumers building from source: `@source "<path-to>/packages/charts/src"` instead — see `apps/playground/src/index.css` for the full pattern every QuickadUI package with hardcoded Tailwind classes follows.)

## Components

- **`StatCard`** (`label`, `value`, `icon?`, `trend?: { direction: "up"|"down", label }`, `children?`) — one metric: a label, a large value, an optional colored trend badge (using QuickadUI's own `success`/`danger` tokens — the same colors `Alert` already uses for those states), and an optional embedded visual (typically a `Sparkline`) as `children`.
- **`Sparkline`** (`data: number[]`, `color?`, `area?`, `width?`, `height?`) — a minimal inline trend line, no axes or legend, meant to live inside a `StatCard` or a narrow `Widget`. Single series only, defaults to QuickadUI's brand accent color.
- **`BarChart`** (`data`, `categoryKey`, `series: { key, label, color? }[]`, `height?`, `valueFormatter?`) — grouped vertical bars, 1+ series, gridlines with clean rounded tick values, a legend once there's more than one series, and a per-bar hover/focus tooltip (the bar itself is the hit target).
- **`LineChart`** (same shape as `BarChart`, plus `area?: boolean`) — multi-series lines with a pointer-following crosshair: hover anywhere over the plot and a shared tooltip lists every series' value at the nearest category, rather than requiring the pointer to land exactly on a line.
- **`DonutChart`** (`data: { key, label, value, color? }[]`, `innerRadiusRatio?`, `size?`, `showTotal?`) — a donut (or, with `innerRadiusRatio={0}`, a pie), segments colored from the categorical palette, a legend, a direct percentage label just outside each large-enough wedge when there are 4 or fewer segments, and a per-segment hover tooltip. `showTotal` (default `true`) prints the sum of all values in the donut's hole.

All five default a **single series** to QuickadUI's own brand accent (`--qa-color-accent-9`) and a **multi-series** chart to the categorical palette below, assigned in a fixed order — pass your own `color`/`colors` to override.

## Usage

```tsx
import { BarChart, DonutChart, LineChart, Sparkline, StatCard } from "@quickadui/charts";

function Dashboard() {
  return (
    <>
      <StatCard label="Revenue (MTD)" value="$18,204" trend={{ direction: "up", label: "+12.4%" }}>
        <Sparkline data={[12000, 12600, 14900, 17200, 18204]} area />
      </StatCard>

      <LineChart
        data={[
          { month: "Jan", revenue: 4200 },
          { month: "Feb", revenue: 4800 },
        ]}
        categoryKey="month"
        series={[{ key: "revenue", label: "Revenue" }]}
        area
      />

      <BarChart
        data={[{ plan: "Free", signups: 120, churned: 8 }]}
        categoryKey="plan"
        series={[
          { key: "signups", label: "Signups" },
          { key: "churned", label: "Churned" },
        ]}
      />

      <DonutChart
        data={[
          { key: "open", label: "Open", value: 12 },
          { key: "resolved", label: "Resolved", value: 34 },
        ]}
      />
    </>
  );
}
```

See `apps/playground`'s `DashboardDemo.tsx` for all five wired together
inside real `@quickadui/shell` `Widget`s, including drag-and-drop
reordering.

## Why a separate categorical palette from the brand/semantic tokens?

`@quickadui/theme`'s `accent`/`success`/`warning`/`danger` tokens are
each a single hand-picked seed color expanded into a 12-step scale,
validated for **UI use** (borders, backgrounds, text contrast). A
categorical **chart** palette needs a different property: every hue must
stay mutually distinguishable from every other one *in the same chart*,
including under color-vision deficiency. Those aren't the same
constraint — running `accent`+`success`+`warning`+`danger`'s four solid
steps together through the palette validator used to build this package
(Anthropic's `dataviz` skill's `scripts/validate_palette.js`) actually
**fails**: `danger` and `warning` sit only ΔE 4.4 apart under a
deuteranopia simulation, because both are warm, muted hues by design —
fine as two independent status colors, not fine as two colors a reader
has to tell apart on sight in the same chart.

So `chart-tokens.css` ships its own **8-hue, fixed-order, pre-validated**
categorical set (light and dark steps, same three-state CSS pattern as
`@quickadui/theme`'s own `tokens.css`) instead. Series beyond the 8th
repeat the last hue rather than inventing a new one with no CVD guarantee
— pass your own `color` per series once you have more than 8, or fold
extras into "Other."

## Interaction

Every chart with more than a bare number ships a hover/focus tooltip by
default (per the `dataviz` skill: "an HTML chart is interactive by
default, omitting the hover layer is the exception"). `BarChart`/
`DonutChart` give each mark its own tooltip; `LineChart` uses a
pointer-following crosshair with one shared tooltip listing every
series at the nearest category. None of this gates the data — every
value shown in a tooltip is also visible in the legend or the chart
itself; the tooltip is a convenience, not the only way to read a number.

## What's not here (yet)

- No zoom, brushing, or animated transitions.
- No table-view fallback for a chart's underlying data (the `dataviz`
  skill recommends one; this package's charts don't render it yet — the
  raw `data` you pass in is already a plain array you can render as a
  table yourself in the meantime).
- No texture/pattern-fill accessibility mode (the skill's opt-in backup
  channel for full-severity color-vision deficiency, print, or
  `forced-colors` — not implemented here).
- Only vertical/grouped bars — no horizontal bars or stacked bars yet.

None of these are architectural dead ends — they're scoped out of this
first round, not designed against.
