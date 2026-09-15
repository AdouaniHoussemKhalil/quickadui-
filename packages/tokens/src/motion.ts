/** Duration tokens, in ms. */
export const duration = {
  fast: 120,
  base: 180,
  slow: 280,
} as const;

/** Easing curves as CSS `cubic-bezier()` strings. */
export const easing = {
  standard: "cubic-bezier(0.2, 0, 0, 1)",
  decelerate: "cubic-bezier(0, 0, 0, 1)",
  accelerate: "cubic-bezier(0.3, 0, 1, 1)",
} as const;

export type DurationKey = keyof typeof duration;
export type EasingKey = keyof typeof easing;
