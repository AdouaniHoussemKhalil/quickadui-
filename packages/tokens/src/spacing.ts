/**
 * Spacing scale, 4px base unit. Values are unitless numbers (px); consumers
 * multiply/convert as needed (Tailwind's `@theme` layer will map these
 * directly to `--spacing-*`, per the QuickadUI Blueprint, §7).
 */
export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
} as const;

export type SpacingKey = keyof typeof spacing;
