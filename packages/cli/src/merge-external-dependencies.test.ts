import { describe, expect, it } from "vitest";
import { mergeExternalDependencies, pickHigherRange } from "./merge-external-dependencies";
import { findPackage } from "./packages";

describe("pickHigherRange", () => {
  it("picks the higher of two caret ranges", () => {
    expect(pickHigherRange("^2.5.0", "^3.6.0")).toBe("^3.6.0");
    expect(pickHigherRange("^3.6.0", "^2.5.0")).toBe("^3.6.0");
  });

  it("compares minor and patch when majors match", () => {
    expect(pickHigherRange("^1.2.0", "^1.10.0")).toBe("^1.10.0");
    expect(pickHigherRange("^1.2.3", "^1.2.9")).toBe("^1.2.9");
  });

  it("returns the first range unchanged when either isn't a plain ^x.y.z", () => {
    expect(pickHigherRange(">=18", ">=18")).toBe(">=18");
    expect(pickHigherRange("^3.25.0 || ^4.0.0", "^3.25.0 || ^4.0.0")).toBe("^3.25.0 || ^4.0.0");
  });

  it("returns a when both ranges are identical", () => {
    expect(pickHigherRange("^1.0.0", "^1.0.0")).toBe("^1.0.0");
  });
});

describe("mergeExternalDependencies", () => {
  it("de-duplicates a dependency shared by several packages", () => {
    const packages = [findPackage("layout"), findPackage("overlays")].filter((pkg) => pkg !== undefined);
    const merged = mergeExternalDependencies(packages);
    const reactEntries = merged.filter((dep) => dep.name === "react");
    expect(reactEntries).toHaveLength(1);
  });

  it("resolves the real tailwind-merge conflict between utils (^3.6.0) and layout (^2.5.0) to the higher range", () => {
    const packages = [findPackage("utils"), findPackage("layout")].filter((pkg) => pkg !== undefined);
    const merged = mergeExternalDependencies(packages);
    const tailwindMerge = merged.find((dep) => dep.name === "tailwind-merge");
    expect(tailwindMerge?.range).toBe("^3.6.0");
  });

  it("returns [] for an empty package list", () => {
    expect(mergeExternalDependencies([])).toEqual([]);
  });
});
