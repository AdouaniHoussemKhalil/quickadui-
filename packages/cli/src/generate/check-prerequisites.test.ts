import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { checkRequiredPackages } from "./check-prerequisites";

let projectDir: string | undefined;

afterEach(() => {
  if (projectDir) {
    rmSync(projectDir, { recursive: true, force: true });
    projectDir = undefined;
  }
});

function makeProject(dependencies: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), "quickadui-generate-test-"));
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "test-app", dependencies }), "utf8");
  projectDir = dir;
  return dir;
}

describe("checkRequiredPackages", () => {
  it("passes silently when every required package is already a dependency", () => {
    const dir = makeProject({ "@quickadui/core": "^0.0.0", "@quickadui/forms": "^0.0.0" });
    expect(() => checkRequiredPackages(dir, ["@quickadui/core", "@quickadui/forms"])).not.toThrow();
  });

  it("throws naming the missing package(s) and the quickadui add command to run", () => {
    const dir = makeProject({ "@quickadui/core": "^0.0.0" });
    expect(() => checkRequiredPackages(dir, ["@quickadui/core", "@quickadui/forms"])).toThrow(
      /@quickadui\/forms.*quickadui add forms/s,
    );
  });

  it("throws when there's no package.json at all", () => {
    const dir = mkdtempSync(join(tmpdir(), "quickadui-generate-test-"));
    projectDir = dir;
    expect(() => checkRequiredPackages(dir, ["@quickadui/core"])).toThrow(/No package\.json found/);
  });

  it("throws a clear error when package.json isn't valid JSON", () => {
    const dir = mkdtempSync(join(tmpdir(), "quickadui-generate-test-"));
    writeFileSync(join(dir, "package.json"), "{ not json", "utf8");
    projectDir = dir;
    expect(() => checkRequiredPackages(dir, ["@quickadui/core"])).toThrow(/isn't valid JSON/);
  });
});
