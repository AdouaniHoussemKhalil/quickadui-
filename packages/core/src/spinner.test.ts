import { describe, expect, it } from "vitest";
import { spinnerVariants } from "./spinner";

describe("spinnerVariants", () => {
  it("defaults to md", () => {
    expect(spinnerVariants()).toBe(spinnerVariants({ size: "md" }));
  });

  it.each([
    ["sm", "size-4"],
    ["md", "size-6"],
    ["lg", "size-8"],
  ] as const)("size=%s includes %s", (size, expectedClass) => {
    expect(spinnerVariants({ size })).toContain(expectedClass);
  });

  it("always spins", () => {
    expect(spinnerVariants()).toContain("animate-spin");
  });
});
