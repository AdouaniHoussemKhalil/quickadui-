/**
 * Type scale. `fontFamily` values are CSS variable *slots*, not literal font
 * names — @quickadui/theme (or the consuming app) fills them in, so
 * QuickadUI never forces a specific typeface on anyone. See Blueprint, §7.
 */
export const fontFamily = {
  sans: "var(--qa-font-sans, ui-sans-serif, system-ui, sans-serif)",
  mono: "var(--qa-font-mono, ui-monospace, 'SFMono-Regular', monospace)",
} as const;

export const fontSize = {
  xs: { size: 12, lineHeight: 16 },
  sm: { size: 14, lineHeight: 20 },
  base: { size: 16, lineHeight: 24 },
  lg: { size: 18, lineHeight: 28 },
  xl: { size: 20, lineHeight: 28 },
  "2xl": { size: 24, lineHeight: 32 },
  "3xl": { size: 30, lineHeight: 36 },
  "4xl": { size: 36, lineHeight: 40 },
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export type FontSizeKey = keyof typeof fontSize;
export type FontWeightKey = keyof typeof fontWeight;
