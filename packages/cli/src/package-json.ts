// Pure helpers for editing a package.json's `dependencies` field. These
// never touch the filesystem — `commands/add.ts` handles reading/writing
// the real file — so they're trivial to unit test and safe to reason
// about (no risk of silently corrupting the caller's other package.json
// fields, since everything not touched here is spread through as-is).

export interface PackageJsonLike {
  readonly dependencies?: Record<string, string> | undefined;
  readonly [key: string]: unknown;
}

/**
 * Returns a new package.json object with `name@range` set in
 * `dependencies`, overwriting any existing entry for that name. The
 * result's `dependencies` keys are alphabetically sorted, so re-running
 * `add` (or adding several packages one at a time) produces a clean,
 * deterministic diff instead of appending to the end each time.
 */
export function addDependency(
  pkgJson: PackageJsonLike,
  name: string,
  range: string,
): PackageJsonLike {
  const nextDependencies: Record<string, string> = {
    ...pkgJson.dependencies,
    [name]: range,
  };

  const sortedDependencies: Record<string, string> = {};
  for (const key of Object.keys(nextDependencies).sort()) {
    sortedDependencies[key] = nextDependencies[key] as string;
  }

  return {
    ...pkgJson,
    dependencies: sortedDependencies,
  };
}

/**
 * Applies `addDependency` for every entry in `deps`, in order. Later
 * entries win if the same name appears twice (matching `addDependency`'s
 * own overwrite behavior).
 */
export function addDependencies(
  pkgJson: PackageJsonLike,
  deps: ReadonlyArray<{ name: string; range: string }>,
): PackageJsonLike {
  return deps.reduce((acc, dep) => addDependency(acc, dep.name, dep.range), pkgJson);
}
