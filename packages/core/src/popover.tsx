"use client";

import {
  Popover as PopoverPrimitive,
  PopoverAnchor as PopoverAnchorPrimitive,
  PopoverArrow as PopoverArrowPrimitive,
  PopoverClose as PopoverClosePrimitive,
  PopoverContent as PopoverContentPrimitive,
  PopoverPortal as PopoverPortalPrimitive,
  PopoverTrigger as PopoverTriggerPrimitive,
} from "@quickadui/primitives";
import { cn } from "@quickadui/utils";
import type { ComponentProps } from "react";

/**
 * Styled Popover — composes `@quickadui/primitives`' Popover parts with
 * QuickadUI's default chrome. `Popover`/`PopoverTrigger`/`PopoverAnchor`/
 * `PopoverClose` are re-exported as-is; `PopoverContent` bakes in the
 * portal and the arrow, since QuickadUI always wants both.
 */
export function Popover(props: ComponentProps<typeof PopoverPrimitive>) {
  return <PopoverPrimitive {...props} />;
}

export function PopoverTrigger(props: ComponentProps<typeof PopoverTriggerPrimitive>) {
  return <PopoverTriggerPrimitive {...props} />;
}

export function PopoverAnchor(props: ComponentProps<typeof PopoverAnchorPrimitive>) {
  return <PopoverAnchorPrimitive {...props} />;
}

export function PopoverClose(props: ComponentProps<typeof PopoverClosePrimitive>) {
  return <PopoverClosePrimitive {...props} />;
}

export function PopoverContent({ className, align = "center", sideOffset = 4, children, ...props }: ComponentProps<typeof PopoverContentPrimitive>) {
  return (
    <PopoverPortalPrimitive>
      <PopoverContentPrimitive
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-72 rounded-md border border-neutral-6 bg-neutral-1 p-4 text-neutral-12 shadow-md outline-none",
          className,
        )}
        {...props}
      >
        {children}
        <PopoverArrowPrimitive className="fill-neutral-1" />
      </PopoverContentPrimitive>
    </PopoverPortalPrimitive>
  );
}
