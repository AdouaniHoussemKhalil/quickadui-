"use client";

import { Tooltip as TooltipPrimitive } from "radix-ui";
import type { ComponentProps } from "react";

/**
 * A thin adapter over Radix UI's Tooltip primitive — see `dialog.tsx` for
 * why this package re-exports rather than lets consumers import `radix-ui`
 * directly, and `slot.tsx` for why every part below is a real function
 * component over `ComponentProps<typeof X>` rather than a raw value
 * re-export.
 *
 * `TooltipProvider` is required exactly once, high in the tree (it's what
 * makes hovering a second tooltip skip the opening delay) — it has no DOM
 * output of its own, so no `data-slot`. `Trigger` likewise gets none, for
 * the same reason `PopoverTrigger` doesn't: it's whatever element the
 * consumer is annotating, not QuickadUI's own chrome.
 */
export function TooltipProvider(props: ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider {...props} />;
}

export function Tooltip(props: ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root {...props} />;
}

export function TooltipTrigger(props: ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger {...props} />;
}

export function TooltipPortal(props: ComponentProps<typeof TooltipPrimitive.Portal>) {
  return <TooltipPrimitive.Portal {...props} />;
}

export function TooltipContent(props: ComponentProps<typeof TooltipPrimitive.Content>) {
  return <TooltipPrimitive.Content data-slot="tooltip-content" {...props} />;
}

/** The little triangle pointing back at `TooltipTrigger` — optional. */
export function TooltipArrow(props: ComponentProps<typeof TooltipPrimitive.Arrow>) {
  return <TooltipPrimitive.Arrow data-slot="tooltip-arrow" {...props} />;
}
