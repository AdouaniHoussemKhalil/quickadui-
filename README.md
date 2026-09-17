# QuickadUI

A complete frontend ecosystem for building React applications quickly
while keeping full control over customization: design tokens, a runtime
theme engine (including runtime brand-color configurability, not just
light/dark/system mode), a headless primitives layer, styled components,
layouts, overlays, forms, data display, animation, icons, hooks, a
dashboard app shell with drag-and-drop widgets, hand-rolled SVG charts,
and a CLI — all under one `@quickadui/*` namespace.

Every package below is real, working code with tests — not a scaffold.
See `ARCHITECTURE.md` for the full design (the "QuickadUI Blueprint")
this repository implements.

## Packages

| Package | What it is |
|---|---|
| [`@quickadui/tokens`](packages/tokens) | Design tokens — the single source of truth for color (OKLCH-generated 12-step scales), space, type, and motion. |
| [`@quickadui/theme`](packages/theme) | `ThemeProvider`/`useTheme()` — light/dark/system mode *and* runtime brand-color overrides, no rebuild required. |
| [`@quickadui/primitives`](packages/primitives) | Headless behavior wrapping Radix UI — unstyled, accessible building blocks. |
| [`@quickadui/core`](packages/core) | Styled core components: Button, IconButton, Card, Badge, Avatar, Alert, Spinner, Skeleton, Typography. |
| [`@quickadui/layout`](packages/layout) | Layout primitives: Stack, Flex, Grid, Container, Section. |
| [`@quickadui/overlays`](packages/overlays) | Modal, Drawer, Toast, and related overlay components. |
| [`@quickadui/forms`](packages/forms) | React Hook Form + Zod-integrated form components. |
| [`@quickadui/data`](packages/data) | Table, Pagination, Stepper, Timeline, TreeView. |
| [`@quickadui/animation`](packages/animation) | `Reveal` and other `motion`-backed animation components. |
| [`@quickadui/icons`](packages/icons) | Wrapped Lucide icons behind one stable `Icon` contract. |
| [`@quickadui/hooks`](packages/hooks) | Standalone React hooks (`useDisclosure`, and more). |
| [`@quickadui/shell`](packages/shell) | Dashboard app shell — `Navbar`/`Sidebar`/`Footer`/`DashboardLayout` plus drag-and-drop `Widget`/`WidgetGrid`. |
| [`@quickadui/charts`](packages/charts) | Dashboard stat/chart components — `StatCard`, `Sparkline`, `BarChart`, `LineChart`, `DonutChart` — hand-rolled SVG, zero charting-library dependency. |
| [`create-quickadui`](packages/cli) | CLI: scaffolds a new project (`quickadui init`) and installs packages into it (`quickadui add`). |
| [`@quickadui/config`](packages/config) | Shared `tsconfig` and Tailwind preset consumed by every package above. |
| [`@quickadui/utils`](packages/utils) | Small internal utilities (`cn`, and more) shared across packages. |

## Getting started

Scaffold a new project:

```bash
npx create-quickadui init my-app
```

Or add packages to an existing Vite + React + Tailwind v4 project:

```bash
npx create-quickadui add core theme
```

```tsx
import { ThemeProvider, ThemeScript } from "@quickadui/theme";
import { Button } from "@quickadui/core";

function App() {
  return (
    <ThemeProvider>
      <Button>Hello, QuickadUI</Button>
    </ThemeProvider>
  );
}
```

```css
/* app.css */
@import "tailwindcss";
@import "@quickadui/theme/tokens.css";
@import "@quickadui/theme/tailwind-theme.css";
```

Each package's own README has full usage details and a `@source`
snippet for its Tailwind classes where relevant.

## Working on this repo

```bash
pnpm install
pnpm build
pnpm dev:playground
```

- `apps/playground` — a live demo exercising every package with real
  props, including the drag-and-drop dashboard (`#dashboard`) and the
  runtime theme/color pickers.
- `apps/docs` — documentation site, live at
  **https://quickadui-docs-nu.vercel.app/** (deployed on Vercel, one page
  per visual package plus `theme`; see `apps/docs/README.md`).
- `templates/`, `examples/` — starter kits and per-package examples,
  populated as the roadmap's hardening phase reaches them.

Every published package needs a changeset before merging
(`pnpm changeset`) — see `.changeset/README.md` and `ARCHITECTURE.md`,
§13.

## Where to start reading

`ARCHITECTURE.md`, §4 (npm package strategy) and §7 (theme architecture)
first — every other decision in this repo inherits from those two.

## License

MIT
