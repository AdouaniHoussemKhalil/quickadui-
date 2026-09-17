# QuickadUI Docs

The dogfooded documentation site for QuickadUI (`ARCHITECTURE.md`, §10) —
built with QuickadUI's own components, same as `apps/playground`.

## MVP scope

This is the first real pass: a running Vite + MDX skeleton with navigation,
a layout, and six hand-written pages (an introduction plus one overview
each for `tokens`, `primitives`, `core`, `forms`, and `data`). Deliberately
**not** in this pass:

- **Generated prop tables.** Every prop table on these pages is
  hand-written. Parsing real TS source into prop tables automatically is
  planned for a later round, once this structure is proven out.
- **Live Sandpack playgrounds.** Examples render live, real
  `@quickadui/*` components, but aren't editable in the browser yet.
- **The other 10 packages, versioning per major, and a migration-guides
  layer** ("from Chakra/MUI/Mantine") — all out of scope for this pass,
  see `ARCHITECTURE.md`, §10/§11.

## Running it

```bash
pnpm install
pnpm --filter docs dev
```

## Structure

- `src/nav.ts` — the fixed page list (keep in sync with `src/Root.tsx`'s
  `PAGES` map).
- `src/Root.tsx` — router-free navigation: reads `location.hash`, same
  pattern as `apps/playground`'s `Root.tsx` (no `react-router-dom` — see
  that file's own comment for why).
- `src/layout/` — `DocsLayout` (sidebar + topbar shell) and `Sidebar`
  (grouped nav links).
- `src/components/` — `PropsTable` (hand-written prop rows, rendered with
  the real `@quickadui/data` `Table`), `Example` (a live component preview,
  optionally paired with a static, read-only source snippet), and
  `ThemeToggle` (light/dark/system, via `@quickadui/theme`'s `useTheme()`).
- `src/pages/*.mdx` — the hand-written pages themselves. Each imports the
  real `@quickadui/*` components it demonstrates directly at the top of
  the file.

## A note on MDX and TypeScript

`.mdx` files here are compiled by `@mdx-js/rollup` using its default,
plain-JavaScript (acorn) expression parser — **not** a TypeScript-aware
one. Any `{ ... }` expression or `import`/`export` statement inside a
`.mdx` file has to be plain JS: no `as` type assertions, no generics, no
type annotations. `tsc` doesn't type-check `.mdx` files at all (they're
outside its default include glob), so this isn't caught by `pnpm
typecheck` — a mistake here only shows up as an MDX compile error at
`pnpm dev`/`pnpm build` time.
