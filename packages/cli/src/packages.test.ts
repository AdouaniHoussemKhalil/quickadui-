import { describe, expect, it } from "vitest";
import { findPackage, QUICKADUI_PACKAGES, resolveDependencyClosure } from "./packages";

describe("findPackage", () => {
  it("finds a package by its full npm name", () => {
    expect(findPackage("@quickadui/core")?.name).toBe("@quickadui/core");
  });

  it("finds a package by its short name", () => {
    expect(findPackage("core")?.name).toBe("@quickadui/core");
  });

  it("returns undefined for an unknown package", () => {
    expect(findPackage("not-a-real-package")).toBeUndefined();
  });

  it("does not include @quickadui/config (monorepo-internal dev tooling, not consumer-installable)", () => {
    expect(findPackage("config")).toBeUndefined();
  });
});

describe("QUICKADUI_PACKAGES", () => {
  it("gives every package a peer dependency on react and react-dom", () => {
    for (const pkg of QUICKADUI_PACKAGES) {
      const names = pkg.externalDependencies.map((dep) => dep.name);
      expect(names).toContain("react");
      expect(names).toContain("react-dom");
    }
  });

  it("only references quickaduiDependencies that exist in the registry", () => {
    for (const pkg of QUICKADUI_PACKAGES) {
      for (const depName of pkg.quickaduiDependencies) {
        expect(findPackage(depName)).toBeDefined();
      }
    }
  });
});

describe("resolveDependencyClosure", () => {
  it("returns just the package itself when it has no quickadui dependencies", () => {
    const result = resolveDependencyClosure(["tokens"]);
    expect(result.map((pkg) => pkg.name)).toEqual(["@quickadui/tokens"]);
  });

  it("includes transitive dependencies before the requested package", () => {
    const result = resolveDependencyClosure(["layout"]);
    const names = result.map((pkg) => pkg.name);
    expect(names).toEqual([
      "@quickadui/tokens",
      "@quickadui/theme",
      "@quickadui/utils",
      "@quickadui/layout",
    ]);
  });

  it("de-duplicates shared dependencies across multiple requested packages", () => {
    const result = resolveDependencyClosure(["layout", "overlays"]);
    const names = result.map((pkg) => pkg.name);
    expect(names.filter((name) => name === "@quickadui/utils")).toHaveLength(1);
    expect(names.filter((name) => name === "@quickadui/theme")).toHaveLength(1);
  });

  it("resolves forms' full closure", () => {
    const result = resolveDependencyClosure(["forms"]);
    const names = result.map((pkg) => pkg.name);
    expect(names).toContain("@quickadui/icons");
    expect(names).toContain("@quickadui/primitives");
    expect(names).toContain("@quickadui/theme");
    expect(names).toContain("@quickadui/utils");
    expect(names).toContain("@quickadui/tokens");
    expect(names.at(-1)).toBe("@quickadui/forms");
  });

  it("resolves charts' closure (icons + utils, no external chart-library dependency)", () => {
    const result = resolveDependencyClosure(["charts"]);
    const names = result.map((pkg) => pkg.name);
    expect(names).toContain("@quickadui/icons");
    expect(names).toContain("@quickadui/utils");
    expect(names.at(-1)).toBe("@quickadui/charts");
    expect(findPackage("charts")?.externalDependencies.map((dep) => dep.name)).toEqual([
      "react",
      "react-dom",
    ]);
  });

  it("throws, naming the bad input, for an unknown package", () => {
    expect(() => resolveDependencyClosure(["not-a-real-package"])).toThrow(/not-a-real-package/);
  });

  it("returns [] for an empty input", () => {
    expect(resolveDependencyClosure([])).toEqual([]);
  });
});
