// Shared by both `generate resource` and `generate auth`: reads the
// target project's package.json and makes sure the QuickadUI packages
// the generated code is about to import are actually installed —
// `quickadui add` always records them under `dependencies` (never
// `devDependencies`; see `packages.ts`/`commands/add.ts`), so that's the
// only field checked here.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { PackageJsonLike } from "../package-json.js";

/**
 * Reads `<projectDir>/package.json` and throws a clear, actionable error
 * if it's missing, isn't valid JSON, or doesn't list every package in
 * `required` under `dependencies` — naming exactly which ones are
 * missing and the exact \`quickadui add\` command to run first. Failing
 * fast here beats generating code that then fails with a wall of "Cannot
 * find module '@quickadui/...'" errors from Vite/tsc later.
 */
export function checkRequiredPackages(projectDir: string, required: readonly string[]): void {
  const packageJsonPath = join(projectDir, "package.json");

  if (!existsSync(packageJsonPath)) {
    throw new Error(
      `No package.json found at "${packageJsonPath}". Run \`quickadui init\` first, or pass --dir to point at an existing project.`,
    );
  }

  const raw = readFileSync(packageJsonPath, "utf8");
  let pkgJson: PackageJsonLike;
  try {
    pkgJson = JSON.parse(raw) as PackageJsonLike;
  } catch (cause) {
    throw new Error(`"${packageJsonPath}" isn't valid JSON.`, { cause });
  }

  const installed = new Set(Object.keys(pkgJson.dependencies ?? {}));
  const missing = required.filter((name) => !installed.has(name));

  if (missing.length > 0) {
    const shortNames = missing.map((name) => name.replace("@quickadui/", ""));
    throw new Error(
      `This generator needs ${missing.join(", ")} installed first. Run \`quickadui add ${shortNames.join(" ")}\`, then try again.`,
    );
  }
}
