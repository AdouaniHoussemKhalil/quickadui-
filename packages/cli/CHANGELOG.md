# create-quickadui

## 0.1.1

### Patch Changes

- 94eb0d8: Fix `quickadui add`'s package registry (`packages.ts`), which had every version range hardcoded to `^0.1.0` — since `^0.1.0` never matches a `0.2.0` release (semver's special-case rule for `0.x` versions), `quickadui add core` (and friends) was silently installing the old 0.1.0 line even after `@quickadui/core`, `@quickadui/data`, `@quickadui/forms`, `@quickadui/primitives`, and `@quickadui/theme` shipped 0.2.0 on npm. Ranges now match what's actually published: `^0.2.0` for those five packages, `^0.1.1` for `@quickadui/layout`/`@quickadui/overlays` (their own patch bump from the same release), unchanged elsewhere.

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
