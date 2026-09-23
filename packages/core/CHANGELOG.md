# @quickadui/core

## 0.2.1

### Patch Changes

- Updated dependencies [a721705]
  - @quickadui/icons@0.2.0

## 0.2.0

### Minor Changes

- f568ca6: Add `Collapsible`, `CopyButton`, and `CopyField` components.

  **Breaking (0.x):** `CopyButtonProps.onCopy` has been renamed to `onCopied` to avoid colliding with the native DOM `onCopy` clipboard event, which was silently shadowing the intended callback. Update any existing `onCopy` usage to `onCopied`.

### Patch Changes

- Updated dependencies [f568ca6]
  - @quickadui/primitives@0.2.0

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
  - @quickadui/primitives@0.1.0
  - @quickadui/utils@0.1.0
