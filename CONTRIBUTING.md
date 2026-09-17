# Contributing to QuickadUI

1. `pnpm install` at the repo root.
2. `pnpm dev` to run every package in watch mode via Turborepo.
3. Every new component needs a co-located test and story before it can
   merge — see the QuickadUI Blueprint, §14.
4. Every change that affects a published package needs a changeset:
   `pnpm changeset`.
5. Public API changes (new exports, removed props, tightened types) need
   a short note on the PR before merge — see Blueprint §14.

Full architecture context: see `ARCHITECTURE.md` and the QuickadUI
Blueprint.

## Biome config notes

`biome.json` is kept free of `//`/`/* */` comments on purpose: Biome
checks `biome.json` itself as a target file (it matches the root
`files.includes` pattern unless explicitly excluded), and that
self-check uses the plain JSON parser rather than the permissive one
Biome's own config loader uses — a comment there causes a real parse
error (and, worse, corrupts the effective settings for the whole run,
so every file falls back to Biome's built-in defaults, e.g. tabs
instead of this repo's configured spaces). `biome.json` is also
explicitly excluded from `files.includes` as a second line of defense.
Put any config rationale here instead of inline in `biome.json`.

- `linter.rules.a11y.useSemanticElements` is turned off repo-wide. This
  design system deliberately builds custom ARIA widgets (TreeView's
  `role="tree"`/`role="group"`, and more to come) on plain elements, per
  the WAI-ARIA Authoring Practices Guide's own patterns. This rule's
  generic role-to-element mapping table doesn't know those patterns and
  pushes toward the wrong element for them — e.g. `fieldset` (a
  form-grouping element) for `role="group"` on a tree node's children.
  An inline `biome-ignore` comment on a JSX element nested inside a
  conditional expression also proved unreliable to attach correctly;
  see git history on `packages/data/src/tree-view.tsx`.
