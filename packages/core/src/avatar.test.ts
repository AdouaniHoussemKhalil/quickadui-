import { describe, expect, it } from "vitest";
import { avatarVariants } from "./avatar";

describe("avatarVariants", () => {
  it("defaults to md", () => {
    expect(avatarVariants()).toBe(avatarVariants({ size: "md" }));
  });

  it.each([
    ["sm", "size-8"],
    ["md", "size-10"],
    ["lg", "size-14"],
  ] as const)("size=%s includes %s", (size, expectedClass) => {
    expect(avatarVariants({ size })).toContain(expectedClass);
  });

  it("is always a circular, clipped container regardless of size", () => {
    expect(avatarVariants()).toContain("rounded-full");
    expect(avatarVariants()).toContain("overflow-hidden");
  });
});
