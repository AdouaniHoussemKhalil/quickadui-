"use client";

import {
  TooltipArrow as TooltipArrowPrimitive,
  TooltipContent as TooltipContentPrimitive,
  TooltipPortal as TooltipPortalPrimitive,
  Tooltip as TooltipPrimitive,
  TooltipProvider as TooltipProviderPrimitive,
  TooltipTrigger as TooltipTriggerPrimitive,
} from "@quickadui/primitives";
import { cn } from "@quickadui/utils";
import type { ComponentProps } from "react";

/**
 * Styled Tooltip — composes `@quickadui/primitives`' Tooltip parts with
 * QuickadUI's default chrome. `TooltipProvider`/`Tooltip`/`TooltipTrigger`
 * are re-exported as-is (no styling to add); `TooltipContent` bakes in the
 * portal and the arrow, since QuickadUI always wants both.
 *
 * `TooltipProvider` must wrap the app (or subtree) exactly once, high in
 * the tree — it's what makes a second tooltip skip the opening delay.
 */
export function TooltipProvider(props: ComponentProps<typeof TooltipProviderPrimitive>) {
  return <TooltipProviderPrimitive {...props} />;
}

export function Tooltip(props: ComponentProps<typeof TooltipPrimitive>) {
  return <TooltipPrimitive {...props} />;
}

export function TooltipTrigger(props: ComponentProps<typeof TooltipTriggerPrimitive>) {
  return <TooltipTriggerPrimitive {...props} />;
}

export function TooltipContent({
  className,
  sideOffset = 4,
  children,
  ...props
}: ComponentProps<typeof TooltipContentPrimitive>) {
  return (
    <TooltipPortalPrimitive>
      <TooltipContentPrimitive
        sideOffset={sideOffset}
        className={cn(
          "z-50 overflow-hidden rounded-md bg-neutral-12 px-3 py-1.5 text-xs text-neutral-1 shadow-md",
          className,
        )}
        {...props}
      >
        {children}
        <TooltipArrowPrimitive className="fill-neutral-12" />
      </TooltipContentPrimitive>
    </TooltipPortalPrimitive>
  );
}
