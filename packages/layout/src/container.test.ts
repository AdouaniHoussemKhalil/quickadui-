import { describe, expect, it } from "vitest";
import { containerVariants } from "./container";

describe("containerVariants", () => {
  it("defaults to maxWidth=xl", () => {
    const withDefaults = containerVariants();
    const explicit = containerVariants({ maxWidth: "xl" });
    expect(withDefaults).toBe(explicit);
  });

  it("always centers and includes horizontal padding", () => {
    expect(containerVariants()).toContain("mx-auto");
    expect(containerVariants()).toContain("px-4");
  });

  it.each([
    ["sm", "max-w-3xl"],
    ["md", "max-w-5xl"],
    ["lg", "max-w-6xl"],
    ["xl", "max-w-7xl"],
    ["full", "max-w-none"],
  ] as const)("maxWidth=%s includes %s", (maxWidth, expectedClass) => {
    expect(containerVariants({ maxWidth })).toContain(expectedClass);
  });
});
