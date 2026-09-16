import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { PackageManager } from "../args.js";
import { mergeExternalDependencies } from "../merge-external-dependencies.js";
import { addDependencies, type PackageJsonLike } from "../package-json.js";
import { type QuickaduiPackageDefinition, resolveDependencyClosure } from "../packages.js";
import { renderAddNextSteps } from "../render-add-next-steps.js";

export interface AddOptions {
  readonly projectDir: string;
  readonly packageNames: readonly string[];
  readonly packageManager: PackageManager;
}

export interface AddResult {
  readonly packageJsonPath: string;
  readonly installedPackages: readonly QuickaduiPackageDefinition[];
  readonly nextSteps: string;
}

/**
 * Adds one or more QuickadUI packages (and everything they transitively
 * depend on, QuickadUI and external alike) to the package.json at
 * `options.projectDir`. Reads and re-writes just that one file — see
 * `render-add-next-steps.ts` for why `index.css` is left for the person
 * to edit themselves rather than guessed at.
 */
export function runAdd(options: AddOptions): AddResult {
  if (options.packageNames.length === 0) {
    throw new Error("`quickadui add` needs at least one package name, e.g. `quickadui add core`.");
  }

  const projectDir = resolve(options.projectDir);
  const packageJsonPath = join(projectDir, "package.json");

  if (!existsSync(packageJsonPath)) {
    throw new Error(`No package.json found at "${packageJsonPath}". Run \`quickadui init\` first, or pass --dir to point at an existing project.`);
  }

  const rawPackageJson = readFileSync(packageJsonPath, "utf8");
  let pkgJson: PackageJsonLike;
  try {
    pkgJson = JSON.parse(rawPackageJson) as PackageJsonLike;
  } catch (cause) {
    throw new Error(`"${packageJsonPath}" isn't valid JSON.`, { cause });
  }

  const installedPackages = resolveDependencyClosure(options.packageNames);
  const quickaduiDeps = installedPackages.map((pkg) => ({ name: pkg.name, range: pkg.version }));
  const externalDeps = mergeExternalDependencies(installedPackages);

  const nextPkgJson = addDependencies(pkgJson, [...quickaduiDeps, ...externalDeps]);
  writeFileSync(packageJsonPath, `${JSON.stringify(nextPkgJson, null, 2)}\n`, "utf8");

  return {
    packageJsonPath,
    installedPackages,
    nextSteps: renderAddNextSteps(installedPackages, options.packageManager),
  };
}
