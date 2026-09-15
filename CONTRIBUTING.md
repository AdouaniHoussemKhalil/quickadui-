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
