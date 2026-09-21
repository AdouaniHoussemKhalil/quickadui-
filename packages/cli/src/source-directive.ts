// Pure formatting for the Tailwind v4 `@source` line a consumer needs to
// add for any QuickadUI package that ships hardcoded utility classes
// (see `QuickaduiPackageDefinition.needsSourceDirective` in packages.ts).
//
// This targets an external consumer installing from npm/pnpm/yarn (not
// the monorepo itself, which uses its own relative `../../packages/<pkg>/src`
// paths in `apps/playground/src/index.css`) — so the path points at the
// package's location inside the consumer's own `node_modules`, matching
// the convention already documented in every styled package's README.
//
// The `../` prefix matters and is not a typo: Tailwind resolves `@source`
// relative to the *stylesheet it's written in*, not the project root or
// cwd (see the Tailwind v4 docs for `@source`). `quickadui init` always
// scaffolds the CSS entry point at `src/index.css`, one directory below
// the project root where `node_modules` actually lives — so from that
// file, `node_modules` is `../node_modules`, not `./node_modules`.
// Getting this wrong doesn't produce an error: Tailwind just silently
// finds nothing under the (nonexistent) `src/node_modules/<package>` and
// every class the package ships goes missing from the generated CSS, so
// every component from it renders completely unstyled with nothing
// pointing at the cause. This was confirmed by direct inspection of a
// real scaffolded-then-`add`ed project stuck exactly this way — every
// `@quickadui/shell` component (Navbar, Sidebar, ...) rendering with zero
// styling despite the package installing correctly and this line being
// present, because it read `./node_modules/@quickadui/shell`.
//
// If a consumer's CSS entry point isn't at `src/index.css` (they moved
// it, or their project predates `quickadui init`), this prefix is wrong
// for them too, in the other direction — `renderAddNextSteps` says so.

const NODE_MODULES_RELATIVE_TO_SRC_INDEX_CSS = "../node_modules";

export function renderSourceDirective(packageName: string): string {
  return `@source "${NODE_MODULES_RELATIVE_TO_SRC_INDEX_CSS}/${packageName}";`;
}
