"use client";

import { Collapsible as CollapsiblePrimitive } from "radix-ui";
import type { ComponentProps } from "react";

/**
 * A thin adapter over Radix UI's Collapsible primitive — a single
 * expand/collapse panel (Root/Trigger/Content): the same shape
 * `AccordionItem` uses internally, but standalone, with no grouping and
 * no "only one open at a time" semantics. See `dialog.tsx` for why this
 * package re-exports rather than lets consumers import `radix-ui`
 * directly, and `slot.tsx` for why every part below is a real function
 * component over `ComponentProps<typeof X>` rather than a raw value
 * re-export.
 *
 * Like `Accordion.Root` (and unlike `DialogPrimitive.Root`), `Collapsible`
 * itself renders a real DOM node (a `<div>`), not just a state manager —
 * so every part here gets a `data-slot`, `Root` included, same reasoning
 * as `accordion.tsx`.
 */
export function Collapsible(props: ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

export function CollapsibleTrigger(props: ComponentProps<typeof CollapsiblePrimitive.Trigger>) {
  return <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />;
}

export function CollapsibleContent(props: ComponentProps<typeof CollapsiblePrimitive.Content>) {
  return <CollapsiblePrimitive.Content data-slot="collapsible-content" {...props} />;
}
