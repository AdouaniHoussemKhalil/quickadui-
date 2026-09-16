"use client";

import { Select as SelectPrimitive } from "radix-ui";
import type { ComponentProps } from "react";

/**
 * A thin adapter over Radix UI's Select primitive — the biggest part set
 * in this package after DropdownMenu/ContextMenu. `Select`/`SelectPortal`
 * render no DOM node of their own (state management and portaling only),
 * same reasoning as `DialogPrimitive.Root`/`Portal` — no `data-slot`.
 * `SelectTrigger` is different from `DropdownMenuTrigger`: it's not a
 * generic thing a consumer composes their own `Button` into via `asChild`,
 * it *is* QuickadUI's own default select button (with its own chevron) —
 * so, like `TabsTrigger`, it gets a slot, and so does everything else
 * below, all of which render QuickadUI's own default select chrome.
 */
export function Select(props: ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root {...props} />;
}

export function SelectTrigger(props: ComponentProps<typeof SelectPrimitive.Trigger>) {
  return <SelectPrimitive.Trigger data-slot="select-trigger" {...props} />;
}

export function SelectValue(props: ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

export function SelectIcon(props: ComponentProps<typeof SelectPrimitive.Icon>) {
  return <SelectPrimitive.Icon data-slot="select-icon" {...props} />;
}

export function SelectPortal(props: ComponentProps<typeof SelectPrimitive.Portal>) {
  return <SelectPrimitive.Portal {...props} />;
}

export function SelectContent(props: ComponentProps<typeof SelectPrimitive.Content>) {
  return <SelectPrimitive.Content data-slot="select-content" {...props} />;
}

export function SelectViewport(props: ComponentProps<typeof SelectPrimitive.Viewport>) {
  return <SelectPrimitive.Viewport data-slot="select-viewport" {...props} />;
}

export function SelectItem(props: ComponentProps<typeof SelectPrimitive.Item>) {
  return <SelectPrimitive.Item data-slot="select-item" {...props} />;
}

export function SelectItemText(props: ComponentProps<typeof SelectPrimitive.ItemText>) {
  return <SelectPrimitive.ItemText data-slot="select-item-text" {...props} />;
}

export function SelectItemIndicator(props: ComponentProps<typeof SelectPrimitive.ItemIndicator>) {
  return <SelectPrimitive.ItemIndicator data-slot="select-item-indicator" {...props} />;
}

export function SelectScrollUpButton(props: ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return <SelectPrimitive.ScrollUpButton data-slot="select-scroll-up-button" {...props} />;
}

export function SelectScrollDownButton(props: ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return <SelectPrimitive.ScrollDownButton data-slot="select-scroll-down-button" {...props} />;
}

export function SelectGroup(props: ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

export function SelectLabel(props: ComponentProps<typeof SelectPrimitive.Label>) {
  return <SelectPrimitive.Label data-slot="select-label" {...props} />;
}

export function SelectSeparator(props: ComponentProps<typeof SelectPrimitive.Separator>) {
  return <SelectPrimitive.Separator data-slot="select-separator" {...props} />;
}

export function SelectArrow(props: ComponentProps<typeof SelectPrimitive.Arrow>) {
  return <SelectPrimitive.Arrow data-slot="select-arrow" {...props} />;
}
