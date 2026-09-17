# QuickadUI Docs

The dogfooded documentation site for QuickadUI (`ARCHITECTURE.md`, §10) —
built with QuickadUI's own components, same as `apps/playground`.

## Live

**https://quickadui-docs-nu.vercel.app/** — deployed on Vercel, redeployed
automatically on every push to the default branch. Hash-based routing (see
`src/Root.tsx`'s comment) means no rewrite rules are needed on Vercel; the
only manual setting is Root Directory = `apps/docs` (Vercel's Turborepo
detection handles the rest).

## Scope

A running Vite + MDX site with navigation, a layout, and one hand-written
page per covered package: an introduction plus an overview each for
`tokens`, `theme`, `primitives`, `core`, `layout`, `forms`, `data`,
`overlays`, `shell`, `charts`, `animation`, and `icons` — every visual
package plus `theme`. `utils`/`hooks` (non-visual utilities) and
`config`/`cli` (tooling) are deliberately out of scope, documented
elsewhere. Deliberately **not** built yet:

- **Generated prop tables.** Every prop table on these pages is
  hand-written. Parsing real TS source into prop tables automatically is
  planned for a later round, once this structure is proven out.
- **Live Sandpack playgrounds.** Examples render live, real
  `@quickadui/*` components, but aren't editable in the browser yet.
- **Versioning per major and a migration-guides layer** ("from
  Chakra/MUI/Mantine") — out of scope for now, see `ARCHITECTURE.md`,
  §10/§11.

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
  optionally paired with a static, read-only source snippet), `ThemeToggle`
  (light/dark/system, via `@quickadui/theme`'s `useTheme()`), and
  `AccentPicker` (a single accent-color override, via the same hook's
  `colors`/`setColor`/`resetColor` — both are rendered together in
  `DocsLayout`'s header).
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
