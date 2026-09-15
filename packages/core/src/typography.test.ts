import { describe, expect, it } from "vitest";
import { typographyVariants } from "./typography";

describe("typographyVariants", () => {
  it("defaults to body", () => {
    expect(typographyVariants()).toBe(typographyVariants({ variant: "body" }));
  });

  it.each([
    ["h1", "text-4xl"],
    ["h2", "text-3xl"],
    ["h3", "text-2xl"],
    ["h4", "text-xl"],
    ["body", "text-base"],
    ["lead", "text-xl"],
    ["small", "text-sm"],
    ["muted", "text-neutral-11"],
  ] as const)("variant=%s includes %s", (variant, expectedClass) => {
    expect(typographyVariants({ variant })).toContain(expectedClass);
  });
});
