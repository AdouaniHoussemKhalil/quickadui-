// @quickadui/tokens
//
// The single source of truth for color, space, type and motion — see the
// QuickadUI Blueprint, §1 and §7. Nothing in this package renders anything;
// it exports plain data and types. @quickadui/theme (and the token-to-CSS
// build script in tooling/, once it exists) are what turn this into CSS
// custom properties and a Tailwind v4 `@theme` block.

export { colors, SEED_COLORS } from "./color/palette";
export type { ColorFamily } from "./color/palette";
export { generateColorToken } from "./color/scale";
export type { ColorScale, ColorToken } from "./color/scale";
export { hexToOklch, oklchToHex } from "./color/oklch";
export type { Oklch } from "./color/oklch";

export { spacing } from "./spacing";
export type { SpacingKey } from "./spacing";

export { radius } from "./radius";
export type { RadiusKey } from "./radius";

export { fontFamily, fontSize, fontWeight } from "./typography";
export type { FontSizeKey, FontWeightKey } from "./typography";

export { duration, easing } from "./motion";
export type { DurationKey, EasingKey } from "./motion";

import { colors } from "./color/palette";
import { duration, easing } from "./motion";
import { radius } from "./radius";
import { spacing } from "./spacing";
import { fontFamily, fontSize, fontWeight } from "./typography";

/** Everything in one object, for consumers who want a single import. */
export const tokens = {
  colors,
  spacing,
  radius,
  fontFamily,
  fontSize,
  fontWeight,
  duration,
  easing,
} as const;
