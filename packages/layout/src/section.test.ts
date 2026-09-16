import { describe, expect, it } from "vitest";
import { sectionVariants } from "./section";

describe("sectionVariants", () => {
  it("defaults to spacing=md", () => {
    const withDefaults = sectionVariants();
    const explicit = sectionVariants({ spacing: "md" });
    expect(withDefaults).toBe(explicit);
  });

  it.each([
    ["sm", "py-8"],
    ["md", "py-12"],
    ["lg", "py-16"],
    ["xl", "py-24"],
  ] as const)("spacing=%s includes %s", (spacing, expectedClass) => {
    expect(sectionVariants({ spacing })).toContain(expectedClass);
  });
});
