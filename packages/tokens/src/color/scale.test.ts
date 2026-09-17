import { describe, expect, it } from "vitest";
import { hexToOklch } from "./oklch";
import { SEED_COLORS } from "./palette";
import { generateColorToken } from "./scale";

// Sub-perceptual noise (a difference no human would notice) comes from sRGB
// gamut clipping when a step's target lightness isn't quite reachable at its
// target chroma — see the comment in scale.ts. Anything under this
// tolerance is not a real ordering violation.
const TOLERANCE = 0.015;

function isNonIncreasing(values: number[], tolerance: number): boolean {
  for (let i = 1; i < values.length; i++) {
    const prev = values[i - 1];
    const curr = values[i];
    if (prev === undefined || curr === undefined) return false; // unreachable for valid input
    if (curr >= prev + tolerance) return false;
  }
  return true;
}

function isNonDecreasing(values: number[], tolerance: number): boolean {
  for (let i = 1; i < values.length; i++) {
    const prev = values[i - 1];
    const curr = values[i];
    if (prev === undefined || curr === undefined) return false; // unreachable for valid input
    if (curr <= prev - tolerance) return false;
  }
  return true;
}

describe.each(Object.entries(SEED_COLORS))("generateColorToken(%s)", (_name, seedHex) => {
  const token = generateColorToken(seedHex);

  it("produces exactly 12 steps for each mode", () => {
    expect(token.light).toHaveLength(12);
    expect(token.dark).toHaveLength(12);
  });

  it("produces valid #RRGGBB hex for every step", () => {
    const hexPattern = /^#[0-9A-F]{6}$/;
    for (const step of [...token.light, ...token.dark]) {
      expect(step).toMatch(hexPattern);
    }
  });

  it("step 9 (index 8) is exactly the seed color, in light mode", () => {
    expect(token.light[8]).toBe(seedHex.toUpperCase());
  });

  it("light-mode lightness runs light-to-dark down the scale", () => {
    const lightness = token.light.map((hex) => hexToOklch(hex).L);
    expect(isNonIncreasing(lightness, TOLERANCE)).toBe(true);
  });

  it("dark-mode lightness runs dark-to-light down the scale", () => {
    const lightness = token.dark.map((hex) => hexToOklch(hex).L);
    expect(isNonDecreasing(lightness, TOLERANCE)).toBe(true);
  });
});

describe("generateColorToken with synthetic edge-case seeds", () => {
  const edgeCases = {
    veryLight: "#F5E6C8",
    veryDark: "#1B1006",
    lowChroma: "#8A8A8A",
  };

  it.each(Object.entries(edgeCases))("stays monotonic for a %s seed", (_name, seedHex) => {
    const token = generateColorToken(seedHex);
    const lightL = token.light.map((hex) => hexToOklch(hex).L);
    const darkL = token.dark.map((hex) => hexToOklch(hex).L);
    expect(isNonIncreasing(lightL, TOLERANCE)).toBe(true);
    expect(isNonDecreasing(darkL, TOLERANCE)).toBe(true);
  });
});
