import { describe, expect, it } from "vitest";
import { gridVariants } from "./grid";

describe("gridVariants", () => {
  it("defaults to 1 column / md gap", () => {
    const withDefaults = gridVariants();
    const explicit = gridVariants({ columns: "1", gap: "md" });
    expect(withDefaults).toBe(explicit);
  });

  it("always includes the base grid class", () => {
    expect(gridVariants()).toContain("grid");
  });

  it.each([
    ["1", "grid-cols-1"],
    ["2", "grid-cols-2"],
    ["3", "grid-cols-3"],
    ["4", "grid-cols-4"],
    ["6", "grid-cols-6"],
    ["12", "grid-cols-12"],
  ] as const)("columns=%s includes %s", (columns, expectedClass) => {
    expect(gridVariants({ columns })).toContain(expectedClass);
  });

  it.each([
    ["none", "gap-0"],
    ["xs", "gap-1"],
    ["sm", "gap-2"],
    ["md", "gap-4"],
    ["lg", "gap-6"],
    ["xl", "gap-8"],
    ["2xl", "gap-12"],
  ] as const)("gap=%s includes %s", (gap, expectedClass) => {
    expect(gridVariants({ gap })).toContain(expectedClass);
  });
});
