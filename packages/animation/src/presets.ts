import type { Transition, Variants } from "motion/react";

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

export const slideDownVariants: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0 },
};

export const slideLeftVariants: Variants = {
  hidden: { opacity: 0, x: 8 },
  visible: { opacity: 1, x: 0 },
};

export const slideRightVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0 },
};

export type RevealPreset =
  | "fade"
  | "scale"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right";

const PRESET_VARIANTS: Record<RevealPreset, Variants> = {
  fade: fadeVariants,
  scale: scaleVariants,
  "slide-up": slideUpVariants,
  "slide-down": slideDownVariants,
  "slide-left": slideLeftVariants,
  "slide-right": slideRightVariants,
};

/**
 * Pure lookup — `Reveal` (see `reveal.tsx`) turns its `preset` prop into
 * the matching `Variants` object through this, rather than a raw object
 * index expression inline, so the mapping itself is a real, unit-tested
 * thing (see `presets.test.ts`) instead of something a typo could break
 * silently inside a component body.
 */
export function getPresetVariants(preset: RevealPreset): Variants {
  return PRESET_VARIANTS[preset];
}

/** A snappy, slightly bouncy default — good for anything the user just triggered (a menu opening, a toast appearing). */
export const springTransition: Transition = { type: "spring", stiffness: 300, damping: 30 };

/** A plain eased fade/slide — good for content that appears on its own (page-load reveals, list items). */
export const easeTransition: Transition = { type: "tween", ease: "easeOut", duration: 0.2 };

/** Shorter than `easeTransition` — for small, frequent transitions (hover states, tab switches) where a 200ms animation would feel sluggish. */
export const quickTransition: Transition = { type: "tween", ease: "easeOut", duration: 0.12 };
