# @quickadui/theme

`ThemeProvider`, the CSS-variable engine, and the Tailwind v4 `@theme`
integration — see the QuickadUI Blueprint, §7.

## What's in here

- **`generateTokensCss(tokens)`** — renders `@quickadui/tokens` into a
  runtime stylesheet of `--qa-*` custom properties, using the three-state
  light/dark pattern: a light-by-default `:root`, a
  `@media (prefers-color-scheme: dark)` block guarded by
  `:root:not([data-theme="light"])`, and an explicit
  `:root[data-theme="dark"]` override. This ships pre-rendered as
  `dist/tokens.css`.
- **`generateTailwindTheme(tokens)`** — renders a Tailwind v4 `@theme` block
  whose values are all `var(--qa-*)` references back into the stylesheet
  above, so Tailwind utilities (`bg-accent-9`, ...) stay theme-reactive
  instead of freezing whatever value was true at build time. Ships
  pre-rendered as `dist/tailwind-theme.css`.
- **`generateScrollbarCss()`** — a ready-made, theme-reactive stylesheet for
  the browser's *native* scrollbar (Firefox's `scrollbar-color`, the
  WebKit/Blink `::-webkit-scrollbar` family), so the default browser gray
  scrollbar doesn't sit next to an otherwise fully themed UI. Same
  `var(--qa-color-*)` references as everything else above, so it follows
  light/dark mode and any runtime `setColor("accent", ...)` override with
  zero extra wiring. Ships pre-rendered as `dist/scrollbar.css` — a
  separate, opt-in import (see "Usage" below), not folded into
  `tokens.css` itself.
- **`ThemeProvider` / `useTheme()`** — a React context that tracks the
  user's chosen mode (`"light" | "dark" | "system"`), resolves `"system"`
  against `prefers-color-scheme` (and keeps tracking it live), and mirrors
  the result onto `document.documentElement`'s `data-theme` attribute and
  into `localStorage`. It also tracks runtime brand-color overrides — see
  "Runtime color configurability" below.
- **`ThemeScript`** / **`getThemeScript()`** — a tiny, dependency-free
  inline script that applies the stored theme *before first paint*. A
  `useEffect` can't do this job: by the time it runs, the first frame has
  already rendered in the wrong theme. Render `<ThemeScript />` as early as
  possible in `<head>`, ahead of `<ThemeProvider>`. (This covers mode only —
  see the note in "Runtime color configurability" about the one-frame gap
  for a stored color override.)
- **`applyColorOverrides` / `clearAllColorOverrides` / `isHexColor` /
  `readStoredColorOverrides` / `storeColorOverrides`** — the lower-level
  functions `ThemeProvider` itself is built on, exported for advanced use
  (SSR frameworks, non-React consumers, or anyone who wants the DOM/storage
  primitives without the React context). Most consumers won't need these
  directly — `useTheme()`'s `setColor`/`resetColor`/`resetColors` cover the
  normal case.

## Usage

```css
/* app.css */
@import "tailwindcss";
@import "@quickadui/theme/tokens.css";
@import "@quickadui/theme/tailwind-theme.css";
@import "@quickadui/theme/scrollbar.css"; /* optional — see "Scrollbar theming" below */
```

```tsx
// root layout
import { ThemeProvider, ThemeScript } from "@quickadui/theme";

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <ThemeScript />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

```tsx
function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <button type="button" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
      {theme === "system" ? `system (${resolvedTheme})` : theme}
    </button>
  );
}
```

`ThemeScript`'s `storageKey` prop must match the one passed to
`ThemeProvider` (both default to `"quickadui-theme"`) — otherwise the
pre-paint script and the provider read from different localStorage keys and
disagree on first render.

## Runtime color configurability

Every color in `@quickadui/tokens` — `accent`, `neutral`, `success`,
`warning`, `danger` — starts from one hand-picked `SEED_COLORS` seed hex,
expanded at **build time** into a 12-step light+dark scale and baked into
`tokens.css` (see `generateColorToken` in `@quickadui/tokens` and
`generateTokensCss` above). Changing a brand color used to mean either
overriding the CSS variables yourself after import, or editing
`SEED_COLORS` and rebuilding the package.

`useTheme()` now also exposes a real **runtime** API for this — call
`setColor` with a new seed and every `accent-*` (or whichever family)
class and CSS variable across the app updates immediately, no rebuild:

```tsx
function AccentPicker() {
  const { colors, setColor, resetColor } = useTheme();

  return (
    <input
      type="color"
      value={colors.accent ?? "#C85A1B"}
      onChange={(event) => setColor("accent", event.target.value)}
    />
  );
}
```

- **`colors`** — the families currently overridden, each a `#RRGGBB` seed.
  A family absent here is still using its build-time `tokens.css` color.
- **`setColor(family, seedHex)`** — regenerates `family`'s full 12-step
  light+dark scale from `seedHex` with the exact same `generateColorToken`
  used to build `tokens.css` in the first place, and writes it back as
  inline CSS custom properties on `document.documentElement` — which is
  what lets it win over `tokens.css`'s `:root`/`@media`/`[data-theme]`
  rules without `!important` or any selector games. Persists to
  `localStorage` (key: `colorStorageKey`, default `"quickadui-colors"`) and
  re-applies the correct light-or-dark half automatically when the mode
  toggles. Throws for anything that isn't a valid `#RRGGBB` hex string.
- **`resetColor(family)`** / **`resetColors()`** — revert one family, or
  every overridden family, back to its build-time color.
- **`defaultColors`** (a `<ThemeProvider>` prop, mirroring `defaultTheme`)
  — seed overrides to use on the very first visit, before anything is
  stored. A returning visitor's own `setColor` choice always wins over
  this on later visits.

**Known gap:** unlike theme mode, a stored color override has no pre-paint
inline-script equivalent — `ThemeScript` only ever applies `data-theme`, so
a returning visitor with a custom accent still sees one frame of the
build-time brand color before `<ThemeProvider>` mounts and corrects it.
Shipping an equivalent script would mean inlining the OKLCH scale generator
itself as a second copy of plain JS; not done in this first round.

## Scrollbar theming

By default, browsers render scrollbars in their own flat gray — even on a
page that's otherwise fully themed through `tokens.css`. `scrollbar.css`
fixes that with a small, dependency-free stylesheet:

```css
@import "@quickadui/theme/scrollbar.css";
```

It's a separate, optional import — not bundled into `tokens.css` — so an
app that already styles its own scrollbars, or wants to keep the OS
default, doesn't have to override anything to opt out. Once imported, it
applies globally to every scrollbar on the page (not just the outer page
scroll — any `overflow-auto`/`overflow-scroll` element too), using the same
`var(--qa-color-accent-9)`/`var(--qa-color-neutral-3)` custom properties
every other themed surface in this library reads from — so it tracks
light/dark mode and any `setColor("accent", ...)` runtime override
automatically, no rebuild.

Covers both scrollbar styling mechanisms browsers actually implement:
Firefox's `scrollbar-color`/`scrollbar-width` (set once on `:root`, since
they're inherited properties — every scrollable descendant picks them up
for free) and the WebKit/Blink `::-webkit-scrollbar` pseudo-element family
(not inherited, so it targets every element directly instead).

`generateScrollbarCss()` is exported from `@quickadui/theme` itself if you
want the raw string — for a custom build pipeline, or to compose it
differently than the pre-rendered `dist/scrollbar.css` does.
