"use client";

import { type HTMLMotionProps, motion, useReducedMotion } from "motion/react";
import { easeTransition, getPresetVariants, type RevealPreset } from "./presets";

export interface RevealProps
  extends Omit<HTMLMotionProps<"div">, "variants" | "initial" | "animate" | "exit"> {
  /** Which of `presets.ts`' variant pairs to animate between. Defaults to `"fade"`. */
  preset?: RevealPreset;
  /**
   * When true (the default) and the visitor's OS/browser has "reduce
   * motion" turned on (`useReducedMotion`, re-exported below, from
   * "motion/react"), renders with a zero-duration transition instead of
   * animating. This only prevents `Reveal` from adding motion of its
   * own — it doesn't reach into whatever an unrelated `motion.div` a
   * consumer builds by hand does.
   */
  respectReducedMotion?: boolean;
}

/**
 * A ready-to-use wrapper around `motion.div`, pre-wired with one of
 * `presets.ts`' variant pairs and `initial="hidden" animate="visible"
 * exit="hidden"` — the shape every one of those pairs is written for.
 * For anything `Reveal`'s fixed prop set doesn't cover (a different
 * `motion` element, `whileHover`, drag, ...), use `motion.div` (or
 * `motion.<tag>`) directly with the same `presets.ts` variants — `Reveal`
 * is a convenience, not the only way to use this package.
 *
 * `exit` only actually animates when this component's unmount is wrapped
 * in `AnimatePresence` (also re-exported below) — without it, Motion has
 * no chance to run the exit animation before the DOM node is gone.
 */
export function Reveal({
  preset = "fade",
  respectReducedMotion = true,
  transition = easeTransition,
  ...props
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const skipAnimation = respectReducedMotion && !!prefersReducedMotion;
  const variants = getPresetVariants(preset);

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={skipAnimation ? { duration: 0 } : transition}
      {...props}
    />
  );
}
