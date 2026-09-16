import { describe, expect, it } from "vitest";
import { addDependencies, addDependency, type PackageJsonLike } from "./package-json";

describe("addDependency", () => {
  it("adds a new dependency without touching other fields", () => {
    const pkg: PackageJsonLike = { name: "my-app", version: "1.0.0" };
    const result = addDependency(pkg, "react", "^19.0.0");
    expect(result).toEqual({ name: "my-app", version: "1.0.0", dependencies: { react: "^19.0.0" } });
  });

  it("does not mutate the input object", () => {
    const pkg: PackageJsonLike = { name: "my-app", dependencies: { react: "^18.0.0" } };
    addDependency(pkg, "react-dom", "^19.0.0");
    expect(pkg).toEqual({ name: "my-app", dependencies: { react: "^18.0.0" } });
  });

  it("overwrites an existing entry for the same name", () => {
    const pkg: PackageJsonLike = { dependencies: { react: "^18.0.0" } };
    const result = addDependency(pkg, "react", "^19.0.0");
    expect(result.dependencies).toEqual({ react: "^19.0.0" });
  });

  it("sorts dependency keys alphabetically", () => {
    const pkg: PackageJsonLike = { dependencies: { zod: "^4.0.0" } };
    const result = addDependency(pkg, "clsx", "^2.1.0");
    expect(Object.keys(result.dependencies as Record<string, string>)).toEqual(["clsx", "zod"]);
  });

  it("works when the input has no dependencies field yet", () => {
    const pkg: PackageJsonLike = { name: "fresh" };
    const result = addDependency(pkg, "react", "^19.0.0");
    expect(result.dependencies).toEqual({ react: "^19.0.0" });
  });
});

describe("addDependencies", () => {
  it("applies every entry, later ones winning on name collision", () => {
    const pkg: PackageJsonLike = {};
    const result = addDependencies(pkg, [
      { name: "react", range: "^18.0.0" },
      { name: "react-dom", range: "^19.0.0" },
      { name: "react", range: "^19.0.0" },
    ]);
    expect(result.dependencies).toEqual({ react: "^19.0.0", "react-dom": "^19.0.0" });
  });

  it("returns the input unchanged when deps is empty", () => {
    const pkg: PackageJsonLike = { name: "my-app" };
    expect(addDependencies(pkg, [])).toEqual(pkg);
  });
});
