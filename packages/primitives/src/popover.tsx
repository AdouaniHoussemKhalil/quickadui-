"use client";

import { Popover as PopoverPrimitive } from "radix-ui";
import type { ComponentProps } from "react";

/**
 * A thin adapter over Radix UI's Popover primitive — see `dialog.tsx` for
 * why this package re-exports rather than lets consumers import `radix-ui`
 * directly, and `slot.tsx` for why every part below is a real function
 * component over `ComponentProps<typeof X>` rather than a raw
 * `export const X = PopoverPrimitive.Y` value re-export (the latter fails
 * `tsc --emitDeclarationOnly` with TS4023 for parts whose Radix-internal
 * type isn't nameable outside its own package).
 *
 * `Trigger`/`Anchor` get no `data-slot`: a popover trigger is almost always
 * the consumer's own `Button` composed in via `asChild`, so there's nothing
 * of QuickadUI's own to style here. `Content`/`Close`/`Arrow` render
 * QuickadUI's own default popover chrome (built in `@quickadui/overlays`,
 * not yet implemented) and get one.
 */
export function Popover(props: ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root {...props} />;
}

export function PopoverTrigger(props: ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger {...props} />;
}

/** Positions the popover relative to something other than `PopoverTrigger` — optional, rarely needed. */
export function PopoverAnchor(props: ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor {...props} />;
}

export function PopoverPortal(props: ComponentProps<typeof PopoverPrimitive.Portal>) {
  return <PopoverPrimitive.Portal {...props} />;
}

export function PopoverContent(props: ComponentProps<typeof PopoverPrimitive.Content>) {
  return <PopoverPrimitive.Content data-slot="popover-content" {...props} />;
}

export function PopoverClose(props: ComponentProps<typeof PopoverPrimitive.Close>) {
  return <PopoverPrimitive.Close data-slot="popover-close" {...props} />;
}

/** The little triangle pointing back at `PopoverTrigger` — optional. */
export function PopoverArrow(props: ComponentProps<typeof PopoverPrimitive.Arrow>) {
  return <PopoverPrimitive.Arrow data-slot="popover-arrow" {...props} />;
}
