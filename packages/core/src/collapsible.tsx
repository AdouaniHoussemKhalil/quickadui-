"use client";

import {
  Collapsible as CollapsiblePrimitive,
  CollapsibleContent as CollapsibleContentPrimitive,
  CollapsibleTrigger as CollapsibleTriggerPrimitive,
} from "@quickadui/primitives";
import { cn } from "@quickadui/utils";
import type { ComponentProps } from "react";
import { ChevronDownIcon } from "./_internal-icons";

/**
 * Styled Collapsible — a single expand/collapse panel, composing
 * `@quickadui/primitives`' Collapsible parts with QuickadUI's default
 * chrome. `CollapsibleTrigger` renders a chevron that rotates via the
 * `data-state` Radix sets on the trigger itself, the same convention
 * `Accordion`'s own trigger uses. For a grouped, only-one-open-at-a-time
 * set of panels instead, use `Accordion`.
 */
export function Collapsible({ className, ...props }: ComponentProps<typeof CollapsiblePrimitive>) {
  return (
    <CollapsiblePrimitive
      data-slot="collapsible"
      className={cn("rounded-md border border-neutral-6", className)}
      {...props}
    />
  );
}

export function CollapsibleTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof CollapsibleTriggerPrimitive>) {
  return (
    <CollapsibleTriggerPrimitive
      className={cn(
        "flex w-full items-center justify-between px-4 py-3 text-sm font-medium transition-all hover:bg-neutral-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-8 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon className="size-4 shrink-0 text-neutral-11 transition-transform duration-200" />
    </CollapsibleTriggerPrimitive>
  );
}

export function CollapsibleContent({
  className,
  children,
  ...props
}: ComponentProps<typeof CollapsibleContentPrimitive>) {
  return (
    <CollapsibleContentPrimitive className="overflow-hidden text-sm" {...props}>
      <div className={cn("px-4 pb-4 pt-0", className)}>{children}</div>
    </CollapsibleContentPrimitive>
  );
}
