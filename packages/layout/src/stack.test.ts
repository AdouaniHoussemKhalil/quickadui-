import { describe, expect, it } from "vitest";
import { stackVariants } from "./stack";

describe("stackVariants", () => {
  it("defaults to column/stretch/md gap", () => {
    const withDefaults = stackVariants();
    const explicit = stackVariants({ direction: "column", align: "stretch", gap: "md" });
    expect(withDefaults).toBe(explicit);
  });

  it("defaults to a vertical stack, unlike Flex's horizontal default", () => {
    expect(stackVariants()).toContain("flex-col");
  });

  it.each([
    ["row", "flex-row"],
    ["column", "flex-col"],
  ] as const)("direction=%s includes %s", (direction, expectedClass) => {
    expect(stackVariants({ direction })).toContain(expectedClass);
  });

  it.each([
    ["start", "items-start"],
    ["center", "items-center"],
    ["end", "items-end"],
    ["stretch", "items-stretch"],
  ] as const)("align=%s includes %s", (align, expectedClass) => {
    expect(stackVariants({ align })).toContain(expectedClass);
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
    expect(stackVariants({ gap })).toContain(expectedClass);
  });
});
