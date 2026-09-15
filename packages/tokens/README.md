# @quickadui/tokens

Design tokens — the single source of truth for color, space, type and motion. See the QuickadUI Blueprint, §1 and §7.

This package exports plain data and types. It renders nothing and has zero runtime dependencies — `@quickadui/theme` (and the token-to-CSS build script in `tooling/`, once it exists) are what turn this into CSS custom properties and a Tailwind v4 `@theme` block.

## Color

Every color family (`accent`, `neutral`, `success`, `warning`, `danger`) is generated from a single hand-picked seed hex, not hand-authored step by step. The generator (`generateColorToken`, in `src/color/scale.ts`) works in OKLCH — the perceptually-uniform color space CSS Color 4 standardized — so lightness steps read as visually even, and it always resolves step 9 back to the exact seed color.

```ts
import { colors, tokens } from "@quickadui/tokens";

colors.accent.light[8]; // "#C85A1B" — step 9, the seed itself
colors.accent.dark[8];  // brightened automatically for legibility on a dark ground

tokens.spacing[4];      // 16 (px)
tokens.radius.md;       // 8 (px)
tokens.duration.base;   // 180 (ms)
```

To generate a scale from a different seed (a new brand color, a one-off semantic color, a white-label theme):

```ts
import { generateColorToken } from "@quickadui/tokens";

const brand = generateColorToken("#2D6CDF");
brand.light; // 12-step tuple, light mode
brand.dark;  // 12-step tuple, dark mode
```

Seed colors should be realistic brand/semantic hues — roughly L 0.15–0.85 in OKLCH terms. See `src/color/scale.test.ts` for what's actually verified: 12 valid hex steps, step 9 matches the seed exactly, and lightness runs monotonically down the scale (light mode) or up it (dark mode).

## What's a placeholder vs. what's real

Color, spacing, radius, typography and motion tokens are real and tested. The Tailwind `@theme` / CSS-variable generation step described in Blueprint §7 is not built yet — that's the next package in Roadmap Phase 1.
