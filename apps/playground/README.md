# QuickadUI Playground

A throwaway Vite + React 19 + Tailwind v4 app for seeing the real,
built QuickadUI packages rendered together — not published, not part of
the release pipeline, not linked from `apps/docs` (the real documentation
site, still a scaffold — see its own README).

It imports every shipped QuickadUI package — `@quickadui/theme` (for
`ThemeProvider` and the generated `tokens.css` / `tailwind-theme.css`),
`@quickadui/core` (every shipped component), `@quickadui/hooks`
(`useDisclosure`), `@quickadui/icons`, `@quickadui/layout`
(`Flex`/`Stack`/`Grid`/`Container`/`Section` — used for the page's own
outer structure too, not just shown in a demo section), `@quickadui/overlays`
(`Modal`/`Drawer`/`ContextMenu`/`Toast`), `@quickadui/forms` (a real
react-hook-form + Zod signup form), `@quickadui/data`
(`Table`/`Pagination`/`Stepper`/`Timeline`/`TreeView`), and
`@quickadui/animation` (`Reveal` + `AnimatePresence`) — and renders a
single page: a live light/dark/system theme toggle, every
`Button`/`IconButton` variant and size, every `Badge` variant, a
`Tooltip`/`Popover`/`DropdownMenu` row, `Modal`/`Drawer`/`ContextMenu`/
`Toast`, a real validated signup form, a `Tabs`/`Accordion` pair, a
handful of icons, a `Card` with `Avatar`/`Spinner`/`Skeleton`, a
row-selectable `Table` with real `Pagination`, a `Stepper`, a `Timeline`,
a `TreeView`, an animated `Reveal` with a preset picker, and the
`Typography` scale.

## Running it

The workspace packages ship pre-built (`dist/`), and `@quickadui/theme`'s
CSS files in particular are generated at build time, not present in
`src/` — so the packages this app depends on have to be built at least
once before it, or Vite can't resolve `@quickadui/theme` /
`@quickadui/core` / `@quickadui/hooks` at all (`Failed to resolve import`).

**Important:** `pnpm --filter playground dev` on its own does **not**
build those dependencies first — `pnpm --filter` runs a single package's
own script directly, bypassing `turbo` (and its `dev` task's
`dependsOn: ["^build"]`) entirely. Two ways to do this correctly, from
the repo root:

```bash
# Option A — one-time full build, then run the app directly
pnpm install
pnpm build
pnpm --filter playground dev

# Option B — let turbo build only playground's dependencies, then start it
pnpm install
pnpm dev:playground
```

Either way, this builds `@quickadui/tokens` → `@quickadui/theme` →
`@quickadui/primitives` → `@quickadui/utils` → `@quickadui/icons` →
`@quickadui/core` / `@quickadui/hooks` / `@quickadui/layout` /
`@quickadui/overlays` / `@quickadui/forms` / `@quickadui/data` /
`@quickadui/animation` first, then starts the Vite dev server (default:
http://localhost:5173). After that first build, `pnpm --filter <package>
dev` (tsup `--watch`) in another terminal picks up source changes in any
one package without re-running the whole build — Vite's dev server
picks up the rebuilt `dist/` on the next browser refresh.

## A real monorepo gotcha: `@source` in `src/index.css`

`src/index.css` has six `@source "../../../packages/<pkg>/src";`
directives, right after the three `@import`s (`core`, `primitives`,
`layout`, `overlays`, `forms`, `data` — `animation` doesn't need one, see
its own README). Without them, this app renders with **zero styling on
every `@quickadui/core` component** — no error anywhere, no missing
network request, nothing in the console; the right `class="..."`
attributes are on the right DOM nodes, there's just no CSS rule backing
any of them.

Why: Tailwind v4's automatic content detection always skips anything
matched by `.gitignore` (this repo ignores `dist` and `node_modules` —
see the root `.gitignore`), which is exactly where `@quickadui/core`'s
compiled output lives once pnpm symlinks it into `node_modules`. A class
like `bg-accent-9` only ever exists as literal text inside
`packages/core/src/button.tsx` — this app's own source never spells it
out (`<Button variant="solid" />` doesn't contain the string
`"bg-accent-9"`), so Tailwind's scanner never sees it and never
generates the rule. `@source` is always scanned regardless of
`.gitignore`/`node_modules`, which is the fix — and it's why this page
can look completely broken while every individual piece (the build, the
CSS file, the component's `className`) is correct in isolation. If a
future package (or a future version of `animation`) adds styled
components and gets imported here, its `src` needs the same `@source`
line, or its classes will silently render invisible the exact same way.

## What to expect on first load

Every component on the page other than `Avatar` was verified against
real React 19 + real `react-dom` in a headless-browser smoke test before
this app was written (see the QuickadUI build notes for how). `Avatar`'s
image-load/fallback-timing behavior comes from `radix-ui`'s real
`Avatar` primitive — that specific piece could not be exercised locally
(no npm registry access in the environment these packages were built in)
and is being run for the first time when you load this page. The first
avatar on the page points at a deliberately broken image URL, so you
should see its "AL" fallback appear after radix's normal fallback delay;
if instead the avatar area stays blank or errors, that is the one thing
about this page that's genuinely new information.
