# @quickadui/theme

## 0.2.0

### Minor Changes

- f568ca6: Add `generateScrollbarCss()` and a new optional `@quickadui/theme/scrollbar.css` export that themes the browser's native scrollbar (Firefox `scrollbar-color`/`scrollbar-width` and the WebKit `::-webkit-scrollbar` family) using the same `--qa-color-*` custom properties as the rest of the design system, so it follows light/dark mode and runtime accent-color overrides automatically.

## 0.1.0

### Minor Changes

- d46a4bd: Initial public release.

  Design tokens (`tokens`) and the runtime theme engine (`theme`, now
  including runtime brand-color configurability via `useTheme()`'s
  `setColor`/`resetColor` — not just light/dark/system mode); a headless
  primitives layer wrapping Radix UI (`primitives`) and the styled
  components built on it (`core`, `layout`, `overlays`, `forms`, `data`,
  `animation`); icons (`icons`) and hooks (`hooks`); a dashboard app shell
  with drag-and-drop widgets (`shell`); hand-rolled SVG stat/chart
  components (`charts`); shared build config (`config`); and the
  `create-quickadui` scaffolding CLI.

### Patch Changes

- Updated dependencies [d46a4bd]
  - @quickadui/tokens@0.1.0
