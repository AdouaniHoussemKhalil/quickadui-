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
  into `localStorage`.
- **`ThemeScript`** / **`getThemeScript()`** — a tiny, dependency-free
  inline script that applies the stored theme *before first paint*. A
  `useEffect` can't do this job: by the time it runs, the first frame has
  already rendered in the wrong theme. Render `<ThemeScript />` as early as
  possible in `<head>`, ahead of `<ThemeProvider>`.

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
