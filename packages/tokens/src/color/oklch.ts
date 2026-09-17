/**
 * Minimal OKLab / OKLCH <-> sRGB color math, zero dependencies.
 *
 * OKLCH is the color space every scale in this package is generated in: it's
 * the space CSS Color 4 standardized specifically because equal steps in L
 * (lightness) read as equal steps to the eye, which plain RGB or HSL cannot
 * promise. Conversion formulas are Björn Ottosson's reference implementation
 * (https://bottosson.github.io/posts/oklab/), the same math CSS itself uses.
 */

export interface Oklch {
  /** Perceptual lightness, 0 (black) to 1 (white). */
  L: number;
  /** Chroma (colorfulness), 0 upward — practical sRGB-representable values
   *  top out well under 0.4 for most hues. */
  C: number;
  /** Hue angle in degrees, 0-360. */
  H: number;
}

interface Rgb {
  r: number;
  g: number;
  b: number;
}

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
}

function hexToRgb(hex: string): Rgb {
  const h = hex.replace("#", "");
  return {
    r: Number.parseInt(h.slice(0, 2), 16) / 255,
    g: Number.parseInt(h.slice(2, 4), 16) / 255,
    b: Number.parseInt(h.slice(4, 6), 16) / 255,
  };
}

function rgbToHex({ r, g, b }: Rgb): string {
  // Out-of-gamut components are clipped rather than thrown on: some
  // requested (L, C, H) triples fall outside what sRGB can represent, and
  // clipping degrades gracefully to the nearest displayable color instead
  // of producing NaN or a crash.
  const toByte = (v: number) =>
    Math.round(Math.min(1, Math.max(0, v)) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toByte(r)}${toByte(g)}${toByte(b)}`.toUpperCase();
}

function rgbToOklab({ r, g, b }: Rgb) {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return {
    L: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  };
}

function oklabToRgb({ L, a, b }: { L: number; a: number; b: number }): Rgb {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  return {
    r: linearToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  };
}

function oklabToOklch({ L, a, b }: { L: number; a: number; b: number }): Oklch {
  const C = Math.sqrt(a * a + b * b);
  let H = (Math.atan2(b, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L, C, H };
}

function oklchToOklab({ L, C, H }: Oklch) {
  const rad = (H * Math.PI) / 180;
  return { L, a: C * Math.cos(rad), b: C * Math.sin(rad) };
}

/** Parse a `#rrggbb` hex color into OKLCH. */
export function hexToOklch(hex: string): Oklch {
  return oklabToOklch(rgbToOklab(hexToRgb(hex)));
}

/** Render an OKLCH color back to `#RRGGBB`, clipping to sRGB gamut. */
export function oklchToHex(color: Oklch): string {
  return rgbToHex(oklabToRgb(oklchToOklab(color)));
}
