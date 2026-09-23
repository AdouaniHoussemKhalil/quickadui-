# @quickadui/icons

## 0.2.0

### Minor Changes

- a721705: Add `CopyIcon`, used by `@quickadui/core`'s `CopyButton`/`CopyField` (added in `@quickadui/core@0.2.0`). It existed in source since that release but was never itself released, so `@quickadui/core@0.2.0` shipped with a `"@quickadui/icons": "workspace:*"` dependency that resolved to the pre-`CopyIcon` `0.1.0` on npm, causing a `[MISSING_EXPORT] "CopyIcon" is not exported by "@quickadui/icons"` bundling error for anyone installing `@quickadui/core` fresh.

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
