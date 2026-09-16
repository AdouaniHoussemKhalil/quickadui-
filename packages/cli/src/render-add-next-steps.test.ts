import { describe, expect, it } from "vitest";
import { resolveDependencyClosure } from "./packages";
import { renderAddNextSteps } from "./render-add-next-steps";

describe("renderAddNextSteps", () => {
  it("names every installed package", () => {
    const packages = resolveDependencyClosure(["core"]);
    const text = renderAddNextSteps(packages, "npm");
    expect(text).toContain("@quickadui/core");
    expect(text).toContain("@quickadui/primitives");
    expect(text).toContain("@quickadui/utils");
  });

  it("uses the right install command per package manager", () => {
    const packages = resolveDependencyClosure(["tokens"]);
    expect(renderAddNextSteps(packages, "npm")).toContain("npm install");
    expect(renderAddNextSteps(packages, "pnpm")).toContain("pnpm install");
    expect(renderAddNextSteps(packages, "yarn")).toContain("`yarn`");
  });

  it("lists an @source line for every package that needs one", () => {
    const packages = resolveDependencyClosure(["core"]);
    const text = renderAddNextSteps(packages, "npm");
    expect(text).toContain('@source "./node_modules/@quickadui/core";');
    expect(text).toContain('@source "./node_modules/@quickadui/primitives";');
  });

  it("says no @source lines are needed when none of the packages require one", () => {
    const packages = resolveDependencyClosure(["tokens"]);
    const text = renderAddNextSteps(packages, "npm");
    expect(text).toContain("No `@source` lines needed");
    expect(text).not.toContain("@source \"./node_modules/");
  });
});
