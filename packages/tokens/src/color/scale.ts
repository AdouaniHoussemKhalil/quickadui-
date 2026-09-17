import { hexToOklch, type Oklch, oklchToHex } from "./oklch";

/**
 * A 12-step color scale, one hex value per step. The step numbering follows
 * the Radix Colors convention referenced in the QuickadUI Blueprint, §7:
 *
 *   1-2  app / subtle backgrounds
 *   3-5  interactive element backgrounds (rest, hover, active)
 *   6-8  borders (subtle, default, hovered/focus)
 *   9-10 solid fills (the brand color itself, and its hover state)
 *   11-12 text (low-contrast, high-contrast)
 *
 * Step 9 is always exactly the seed color — every other step is generated
 * from it, so the scale always resolves back to the color that was asked
 * for.
 */
export type ColorScale = readonly [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

export interface ColorToken {
  light: ColorScale;
  dark: ColorScale;
}

// Chroma tapers toward the ends of the scale (near-white backgrounds and
// near-black text can't hold much saturation without clipping out of sRGB
// gamut) and peaks around the solid fill, where the color should read as
// fully itself.
const CHROMA_CURVE = [0.05, 0.08, 0.15, 0.25, 0.35, 0.5, 0.7, 0.9, 1.0, 1.0, 0.55, 0.3] as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

/**
 * Generates the 12 target lightness values for one mode. Every non-solid
 * step is a *proportional* interpolation relative to the solid step (never
 * an additive offset) — that's what keeps the scale monotonic (background
 * steps always lighter than the solid, text steps always darker, or the
 * mirror image in dark mode) no matter how light or dark the seed color
 * itself happens to be. See the QuickadUI Blueprint, §7.
 */
function targetLightness(seedL: number, mode: "light" | "dark"): number[] {
  const L = new Array<number>(12);

  if (mode === "light") {
    const solidL = seedL; // step 9 IS the seed
    // Step 8 sits a proportional distance between the solid and white, so
    // it's always strictly lighter than the solid, regardless of solidL.
    const step8L = Math.min(solidL + (0.995 - solidL) * 0.35, 0.97);
    for (let i = 0; i < 7; i++) L[i] = lerp(0.99, step8L, easeOutQuad(i / 6));
    L[7] = step8L;
    L[8] = solidL;
    // Proportional fractions of the solid — never additive — so ordering
    // (0.85 > 0.55 > 0.25) holds for any solidL, including very dark seeds.
    L[9] = solidL * 0.85;
    L[10] = solidL * 0.55;
    L[11] = solidL * 0.25;
  } else {
    // Dark mode brightens the solid so it stays legible against a dark
    // background — the same adjustment made by hand in the Blueprint's own
    // dark-theme accent, now derived instead of hand-picked.
    const solidL = clamp(seedL + 0.15, 0.45, 0.8);
    const step8L = solidL - (solidL - 0.02) * 0.35;
    for (let i = 0; i < 7; i++) L[i] = lerp(0.14, step8L, easeOutQuad(i / 6));
    L[7] = step8L;
    L[8] = solidL;
    // Proportional fractions of the *headroom to white* — same trick,
    // mirrored — so 10 < 11 < 12 holds for any solidL.
    L[9] = 1 - (1 - solidL) * 0.85;
    L[10] = 1 - (1 - solidL) * 0.45;
    L[11] = 1 - (1 - solidL) * 0.15;
  }

  return L;
}

/**
 * Generates a full light + dark 12-step scale from a single seed color.
 *
 * The seed should be a realistic brand or semantic color — roughly
 * L 0.15-0.85 in OKLCH terms, which in practice means "not already
 * near-white or near-black." Scales generated from such colors are not
 * guaranteed to stay monotonic; see `scale.test.ts`.
 */
export function generateColorToken(seedHex: string): ColorToken {
  const seed = hexToOklch(seedHex);

  const toScale = (mode: "light" | "dark"): ColorScale => {
    const lightness = targetLightness(seed.L, mode);
    const steps = lightness.map((L, i) => {
      // Safe: `lightness` always has exactly 12 entries (see
      // targetLightness), matching CHROMA_CURVE's fixed length.
      const chromaFactor = CHROMA_CURVE[i] ?? 1;
      return oklchToHex({ L, C: seed.C * chromaFactor, H: seed.H } satisfies Oklch);
    });
    return steps as unknown as ColorScale;
  };

  return { light: toScale("light"), dark: toScale("dark") };
}
