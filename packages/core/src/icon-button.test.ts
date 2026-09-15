import { describe, expect, it } from "vitest";
import { iconButtonVariants } from "./icon-button";

describe("iconButtonVariants", () => {
  it("defaults to ghost/md", () => {
    expect(iconButtonVariants()).toBe(iconButtonVariants({ variant: "ghost", size: "md" }));
  });

  it.each([
    ["solid", "bg-accent-9"],
    ["soft", "bg-accent-3"],
    ["outline", "border-accent-7"],
    ["ghost", "bg-transparent"],
  ] as const)("variant=%s includes %s", (variant, expectedClass) => {
    expect(iconButtonVariants({ variant })).toContain(expectedClass);
  });

  it.each([
    ["sm", "size-8"],
    ["md", "size-10"],
    ["lg", "size-12"],
  ] as const)("size=%s includes %s", (size, expectedClass) => {
    expect(iconButtonVariants({ size })).toContain(expectedClass);
  });
});
