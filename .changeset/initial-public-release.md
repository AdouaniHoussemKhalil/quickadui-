---
"@quickadui/animation": minor
"@quickadui/charts": minor
"create-quickadui": minor
"@quickadui/config": minor
"@quickadui/core": minor
"@quickadui/data": minor
"@quickadui/forms": minor
"@quickadui/hooks": minor
"@quickadui/icons": minor
"@quickadui/layout": minor
"@quickadui/overlays": minor
"@quickadui/primitives": minor
"@quickadui/shell": minor
"@quickadui/theme": minor
"@quickadui/tokens": minor
"@quickadui/utils": minor
---

Initial public release.

Design tokens (`tokens`) and the runtime theme engine (`theme`, now
including runtime brand-color configurability via `useTheme()`'s
`setColor`/`resetColor` — not just light/dark/system mode); a headless
primitives layer wrapping Radix UI (`primitives`) and the styled
components built on it (`core`, `layout`, `overlays`, `forms`, `data`,
`animation`); icons (`icons`) and hooks (`hooks`); a dashboard app shell
with drag-and-drop widgets (`shell`); hand-rolled SVG stat/chart
components (`charts`); shared build config (`config`); and the
`create-quickadui` scaffolding CLI.
