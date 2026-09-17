import { describe, expect, it } from "vitest";
import {
  fadeVariants,
  getPresetVariants,
  scaleVariants,
  slideDownVariants,
  slideLeftVariants,
  slideRightVariants,
  slideUpVariants,
} from "./presets";

describe("getPresetVariants", () => {
  it.each([
    ["fade", fadeVariants],
    ["scale", scaleVariants],
    ["slide-up", slideUpVariants],
    ["slide-down", slideDownVariants],
    ["slide-left", slideLeftVariants],
    ["slide-right", slideRightVariants],
  ] as const)("resolves %s to its matching variants object", (preset, expected) => {
    expect(getPresetVariants(preset)).toBe(expected);
  });

  it("every preset defines both a hidden and a visible state", () => {
    const presets = [
      "fade",
      "scale",
      "slide-up",
      "slide-down",
      "slide-left",
      "slide-right",
    ] as const;
    for (const preset of presets) {
      const variants = getPresetVariants(preset);
      expect("hidden" in variants).toBe(true);
      expect("visible" in variants).toBe(true);
    }
  });
});
