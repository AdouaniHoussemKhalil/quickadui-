import { describe, expect, it } from "vitest";
import { textareaVariants } from "./textarea";

describe("textareaVariants", () => {
  it("defaults to state=default", () => {
    const withDefaults = textareaVariants();
    const explicit = textareaVariants({ state: "default" });
    expect(withDefaults).toBe(explicit);
  });

  it("always includes the base layout classes", () => {
    expect(textareaVariants()).toContain("flex");
    expect(textareaVariants()).toContain("min-h-[80px]");
  });

  it.each([
    ["default", "border-neutral-7"],
    ["error", "border-danger-7"],
  ] as const)("state=%s includes %s", (state, expectedClass) => {
    expect(textareaVariants({ state })).toContain(expectedClass);
  });
});
