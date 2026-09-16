import { describe, expect, it } from "vitest";
import { timelineDotVariants } from "./timeline";

describe("timelineDotVariants", () => {
  it("defaults to variant=default", () => {
    const withDefaults = timelineDotVariants();
    const explicit = timelineDotVariants({ variant: "default" });
    expect(withDefaults).toBe(explicit);
  });

  it("always includes the base dot shape classes", () => {
    expect(timelineDotVariants()).toContain("rounded-full");
    expect(timelineDotVariants()).toContain("size-3");
  });

  it.each([
    ["default", "bg-neutral-9"],
    ["accent", "bg-accent-9"],
    ["success", "bg-success-9"],
    ["warning", "bg-warning-9"],
    ["danger", "bg-danger-9"],
  ] as const)("variant=%s includes %s", (variant, expectedClass) => {
    expect(timelineDotVariants({ variant })).toContain(expectedClass);
  });
});
