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
