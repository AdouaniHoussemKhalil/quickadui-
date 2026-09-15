import { describe, expect, it } from "vitest";
import { alertVariants } from "./alert";

describe("alertVariants", () => {
  it("defaults to the neutral variant", () => {
    expect(alertVariants()).toBe(alertVariants({ variant: "default" }));
  });

  it.each([
    ["default", "border-neutral-6"],
    ["success", "border-success-7"],
    ["warning", "border-warning-7"],
    ["danger", "border-danger-7"],
  ] as const)("variant=%s includes %s", (variant, expectedClass) => {
    expect(alertVariants({ variant })).toContain(expectedClass);
  });

  it("reserves space for a leading icon via :has(svg)", () => {
    expect(alertVariants()).toContain("[&:has(svg)]:pl-11");
  });
});
