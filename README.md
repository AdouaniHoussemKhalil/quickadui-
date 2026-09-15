# QuickadUI

A complete frontend ecosystem for building React applications quickly
while keeping full control over customization: components, layouts,
theming, hooks, icons, animation, a CLI, and — eventually — AI-assisted
generation, all under one `@quickadui/*` namespace.

This repository is currently a **scaffold**: the folder structure,
workspace tooling, and package boundaries described in the QuickadUI
Blueprint, with placeholder implementations. No component logic has
been written yet — see `ARCHITECTURE.md` for the full plan this
structure was generated from.

## Layout

- `apps/` — deployed, never published (`docs`, `playground`).
- `packages/` — everything published to npm under `@quickadui/*`.
- `templates/` — full starter kits the CLI clones (populated later).
- `examples/` — one runnable example per package (populated alongside
  each package's first real implementation).
- `tooling/` — internal build and release scripts.

## Getting started

```bash
pnpm install
pnpm build
pnpm dev
```

## Where to start reading

`ARCHITECTURE.md`, §4 (npm package strategy) and §7 (theme architecture)
first — every other decision in this repo inherits from those two.
