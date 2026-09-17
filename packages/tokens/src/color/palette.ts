import type { ColorToken } from "./scale";
import { generateColorToken } from "./scale";

/**
 * Brand and semantic seed colors. Each seed generates a full 12-step
 * light + dark scale (see `scale.ts`) — these hex values are the only
 * hand-picked numbers in the whole color system, and they're the same
 * accent, neutral, and semantic hues used in the QuickadUI Blueprint
 * itself, kept here as the one real source of truth going forward.
 */
export const SEED_COLORS = {
  accent: "#C85A1B",
  neutral: "#171A21",
  success: "#1A7F5A",
  warning: "#9A6B0C",
  danger: "#B23A2B",
} as const;

export type ColorFamily = keyof typeof SEED_COLORS;

/** The full generated color palette: one 12-step light+dark scale per family. */
export const colors: Record<ColorFamily, ColorToken> = Object.fromEntries(
  Object.entries(SEED_COLORS).map(([name, seed]) => [name, generateColorToken(seed)]),
) as Record<ColorFamily, ColorToken>;
