"use client";

import { Accordion as AccordionPrimitive } from "radix-ui";
import type { ComponentProps } from "react";

/**
 * A thin adapter over Radix UI's Accordion primitive — see `dialog.tsx` for
 * why this package re-exports rather than lets consumers import `radix-ui`
 * directly, and `slot.tsx` for why every part below is a real function
 * component over `ComponentProps<typeof X>` rather than a raw value
 * re-export.
 *
 * Every part here is QuickadUI's own visible, always-styled chrome (same
 * reasoning as `tabs.tsx`), so every part gets a `data-slot`, `Root`
 * included. `AccordionHeader` exists purely to wrap `AccordionTrigger` in
 * the correct heading semantics — Radix requires it, so it's exposed here
 * rather than baked silently into `AccordionTrigger`.
 */
export function Accordion(props: ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

export function AccordionItem(props: ComponentProps<typeof AccordionPrimitive.Item>) {
  return <AccordionPrimitive.Item data-slot="accordion-item" {...props} />;
}

export function AccordionHeader(props: ComponentProps<typeof AccordionPrimitive.Header>) {
  return <AccordionPrimitive.Header data-slot="accordion-header" {...props} />;
}

export function AccordionTrigger(props: ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return <AccordionPrimitive.Trigger data-slot="accordion-trigger" {...props} />;
}

export function AccordionContent(props: ComponentProps<typeof AccordionPrimitive.Content>) {
  return <AccordionPrimitive.Content data-slot="accordion-content" {...props} />;
}
