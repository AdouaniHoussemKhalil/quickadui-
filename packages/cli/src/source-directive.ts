// Pure formatting for the Tailwind v4 `@source` line a consumer needs to
// add for any QuickadUI package that ships hardcoded utility classes
// (see `QuickaduiPackageDefinition.needsSourceDirective` in packages.ts).
//
// This targets an external consumer installing from npm/pnpm/yarn (not
// the monorepo itself, which uses its own relative `../../packages/<pkg>/src`
// paths in `apps/playground/src/index.css`) — so the path points at the
// package's location inside the consumer's own `node_modules`, matching
// the convention already documented in every styled package's README.

export function renderSourceDirective(packageName: string): string {
  return `@source "./node_modules/${packageName}";`;
}
