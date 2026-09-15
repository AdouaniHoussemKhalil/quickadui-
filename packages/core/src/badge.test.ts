import { describe, expect, it } from "vitest";
import { badgeVariants } from "./badge";

describe("badgeVariants", () => {
  it("defaults to soft", () => {
    expect(badgeVariants()).toBe(badgeVariants({ variant: "soft" }));
  });

  it.each([
    ["solid", "bg-accent-9"],
    ["soft", "bg-accent-3"],
    ["outline", "border-accent-7"],
    ["success", "bg-success-3"],
    ["warning", "bg-warning-3"],
    ["danger", "bg-danger-3"],
  ] as const)("variant=%s includes %s", (variant, expectedClass) => {
    expect(badgeVariants({ variant })).toContain(expectedClass);
  });
});
