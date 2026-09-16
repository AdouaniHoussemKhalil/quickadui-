"use client";

import {
  Accordion as AccordionPrimitive,
  AccordionContent as AccordionContentPrimitive,
  AccordionHeader as AccordionHeaderPrimitive,
  AccordionItem as AccordionItemPrimitive,
  AccordionTrigger as AccordionTriggerPrimitive,
} from "@quickadui/primitives";
import { cn } from "@quickadui/utils";
import type { ComponentProps } from "react";
import { ChevronDownIcon } from "./_internal-icons";

/**
 * Styled Accordion — composes `@quickadui/primitives`' Accordion parts with
 * QuickadUI's default chrome. `AccordionTrigger` bakes in the
 * `AccordionHeader` wrapping Radix requires (an ergonomic simplification so
 * consumers don't need to import it separately) and renders a chevron that
 * rotates via the `data-state` Radix sets on the trigger itself.
 */
export function Accordion(props: ComponentProps<typeof AccordionPrimitive>) {
  return <AccordionPrimitive {...props} />;
}

export function AccordionItem({ className, ...props }: ComponentProps<typeof AccordionItemPrimitive>) {
  return <AccordionItemPrimitive className={cn("border-b border-neutral-6", className)} {...props} />;
}

export function AccordionTrigger({ className, children, ...props }: ComponentProps<typeof AccordionTriggerPrimitive>) {
  return (
    <AccordionHeaderPrimitive className="flex">
      <AccordionTriggerPrimitive
        className={cn(
          "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-8 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="size-4 shrink-0 text-neutral-11 transition-transform duration-200" />
      </AccordionTriggerPrimitive>
    </AccordionHeaderPrimitive>
  );
}

export function AccordionContent({ className, children, ...props }: ComponentProps<typeof AccordionContentPrimitive>) {
  return (
    <AccordionContentPrimitive className="overflow-hidden text-sm" {...props}>
      <div className={cn("pb-4 pt-0", className)}>{children}</div>
    </AccordionContentPrimitive>
  );
}
