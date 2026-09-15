import { describe, expect, it } from "vitest";
import { buttonVariants } from "./button";

describe("buttonVariants", () => {
  it("defaults to solid/md", () => {
    const withDefaults = buttonVariants();
    const explicit = buttonVariants({ variant: "solid", size: "md" });
    expect(withDefaults).toBe(explicit);
  });

  it("includes the base layout classes regardless of variant", () => {
    expect(buttonVariants()).toContain("inline-flex");
    expect(buttonVariants()).toContain("rounded-md");
  });

  it.each([
    ["solid", "bg-accent-9"],
    ["soft", "bg-accent-3"],
    ["outline", "border-accent-7"],
    ["ghost", "bg-transparent"],
    ["destructive", "bg-danger-9"],
  ] as const)("variant=%s includes %s", (variant, expectedClass) => {
    expect(buttonVariants({ variant })).toContain(expectedClass);
  });

  it.each([
    ["sm", "h-8"],
    ["md", "h-10"],
    ["lg", "h-12"],
  ] as const)("size=%s includes %s", (size, expectedClass) => {
    expect(buttonVariants({ size })).toContain(expectedClass);
  });
});
