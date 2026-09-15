# QuickadUI Architecture

Condensed reference. The full document, with rationale, trade-offs and
a visual roadmap for each decision, is the QuickadUI Blueprint.

## 1. Project architecture

Six layers, each depending only on the one beneath it: **tokens** →
**primitives** (unstyled behavior, wraps Radix UI) → **components**
(styled defaults) → **patterns** (compound, multi-component) →
**layouts & templates** → **apps** (CLI-generated). Four pillars cut
across every layer: icons, hooks & utilities, motion, tooling.

## 2. Folder structure

See this repository's own top-level layout — it *is* the answer.
`packages/*` is split at the domain level (core, forms, overlays, data,
layout, …), not one package per component.

## 3. Monorepo organization

pnpm workspaces + pnpm catalogs (centralized version pinning) +
Turborepo (task graph, local/remote caching, affected-only CI). Not Nx:
the whole stack is JS/TS-only, and Nx's cross-language plugin system and
enforced module boundaries are power this repo doesn't need yet.

## 4. npm package strategy

**The central decision.** Tailwind's JIT doesn't scan `node_modules` by
default, so a Tailwind-based component library published as a plain npm
package silently ships unstyled. QuickadUI ships two ways from the same
source: a **compiled** npm package (pre-built JS + one generated
`styles.css`, zero config) and a **source-copy CLI** (`quickadui add`,
shadcn-style) that copies real `.tsx` + Tailwind classes into the
consumer's own tree for full editability. `@quickadui` scope, plus one
unscoped `quickadui` meta-package for convenience installs.

## 5. Recommended dependencies

React 19 · TypeScript strict · Tailwind CSS v4 · Radix UI (wrapped
behind `@quickadui/primitives`, Base UI is the tracked migration
candidate) · class-variance-authority · clsx + tailwind-merge · React
Hook Form + Zod · `motion` (formerly Framer Motion) · Lucide React
(wrapped) · tsup now, tsdown later · Sandpack for docs playgrounds.

## 6. Naming conventions

Components: PascalCase, compound dot-notation (`Tabs.List`). Props:
native-HTML-style booleans (`disabled`, not `isDisabled`); polymorphism
via `asChild`, not a generic `as` prop. Files: kebab-case, co-located
test + story. Tokens: `--qa-` prefix, 12-step numeric color scale.

## 7. Theme architecture

One token source (`@quickadui/tokens`) compiled three ways: runtime CSS
custom properties, a Tailwind v4 `@theme` block, and generated TS types.
Each color is a 12-step scale (Radix Colors methodology) so contrast is
correct by construction. `ThemeProvider` swaps a `data-theme` attribute,
set by a pre-paint inline script to avoid flash-of-wrong-theme; the same
mechanism powers multi-brand/white-label theming.

## 8. Component philosophy

Headless-first, styled by default: every stateful component is an
unstyled `@quickadui/primitives` export plus a styled default built on
top. Compound components over config objects for anything with more
than ~2 sub-parts. Controlled and uncontrolled APIs, always both.
Accessibility is a merge gate, not a follow-up ticket.

## 9. Configuration system

`quickadui.config.ts` + `npx quickadui init` (framework detection,
Tailwind preset wiring, `ThemeProvider` scaffolding). Post-1.0: a plugin
system lets third parties register into the same `add` registry the AI
generation feature will also write into.

## 10. Documentation strategy

`apps/docs` is a dogfooded Vite + MDX site built with QuickadUI's own
components. Prop tables generated from TS source (never hand-maintained).
Live Sandpack playgrounds. Versioned per published major. A guides layer
includes explicit "Migrating from Chakra/MUI/Mantine" content.

## 11. Testing strategy

Vitest + Testing Library (unit/component) · Storybook + Chromatic
(visual regression) · Playwright (docs site + starter e2e) · axe-core in
CI (accessibility gate) · `expect-type`/`tsd` (public type-contract
lock).

## 12. CI/CD strategy

GitHub Actions, Turborepo affected-only filtering. PR: lint, typecheck,
test, build, Chromatic diff, `size-limit` budget check, docs preview
deploy, Changesets bot comment. Merge to `main`: opens a "Version
Packages" PR; only merging *that* PR publishes to npm. A separate
`next`-tag canary publishes from every merge to `main`.

## 13. Release strategy

Changesets, independent per-package semver — not lockstep. Pre-1.0: 0.x
releases may break in a minor bump, always flagged in the changelog.
Post-1.0: strict semver, one full minor cycle of deprecation warning
before removal, LTS revisited once real enterprise demand exists.

## 14. Coding standards

Biome for formatting + core linting; ESLint layered in narrowly for
React-hooks and `jsx-a11y` coverage Biome doesn't have yet. TypeScript
strict repo-wide via `@quickadui/config`. Conventional Commits. A CI
check blocks new component files missing a co-located test/story.
Public API changes need a written note on the PR before merge.

## 15. Roadmap: 0.1.0 → 1.0.0

- **0.1–0.4 Foundation** — tokens, theme engine, primitives adapter,
  12-15 core/form components, `quickadui init`, docs skeleton, CI.
- **0.5–0.7 Breadth** — overlays, data, layout, icons, hooks, animation;
  Chromatic live; docs playground.
- **0.8–0.9 Hardening** — full a11y audit, bundle budgets, public-API
  RFC freeze, `quickadui add`, starter templates, release candidate.
- **1.0.0 Stability** — strict semver begins, deprecation policy
  published, migration guide from 0.x, bundle benchmarks published.
- AI generation, CRUD generators, and CMS blocks are explicitly a
  post-1.0 track — never allowed to compete with stability pre-1.0.
