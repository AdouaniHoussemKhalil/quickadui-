import { describe, expect, it } from "vitest";
import { inputVariants } from "./input";

describe("inputVariants", () => {
  it("defaults to inputSize=md, state=default", () => {
    const withDefaults = inputVariants();
    const explicit = inputVariants({ inputSize: "md", state: "default" });
    expect(withDefaults).toBe(explicit);
  });

  it("always includes the base layout classes", () => {
    expect(inputVariants()).toContain("flex");
    expect(inputVariants()).toContain("w-full");
  });

  it.each([
    ["sm", "h-8"],
    ["md", "h-10"],
    ["lg", "h-12"],
  ] as const)("inputSize=%s includes %s", (inputSize, expectedClass) => {
    expect(inputVariants({ inputSize })).toContain(expectedClass);
  });

  it.each([
    ["default", "border-neutral-7"],
    ["error", "border-danger-7"],
  ] as const)("state=%s includes %s", (state, expectedClass) => {
    expect(inputVariants({ state })).toContain(expectedClass);
  });

  it("error state does not include the default focus ring color", () => {
    expect(inputVariants({ state: "error" })).not.toContain("ring-accent-8/30");
  });
});
