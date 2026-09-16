"use client";

import { ContextMenu as ContextMenuPrimitive } from "radix-ui";
import type { ComponentProps } from "react";

/**
 * A thin adapter over Radix UI's ContextMenu primitive — see `dialog.tsx`
 * for why this package re-exports rather than lets consumers import
 * `radix-ui` directly, and `slot.tsx` for why every part below is a real
 * function component over `ComponentProps<typeof X>` rather than a raw
 * value re-export. The part shape mirrors `dropdown-menu.tsx` almost
 * exactly — Radix's ContextMenu and DropdownMenu APIs are near-identical,
 * differing mainly in how they open (right-click vs. click/keyboard).
 *
 * `ContextMenuTrigger`/`Portal`/`Sub` get no `data-slot` — same
 * reasoning as `DropdownMenuTrigger`/`Portal`/`Sub`: `Trigger` wraps
 * whatever arbitrary content the consumer right-clicks on (not
 * QuickadUI's own chrome), `Portal`/`Sub` render no DOM node of their
 * own. `SubTrigger` is a menu item styled like `Item`, so it gets one.
 */
export function ContextMenu(props: ComponentProps<typeof ContextMenuPrimitive.Root>) {
  return <ContextMenuPrimitive.Root {...props} />;
}

export function ContextMenuTrigger(props: ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
  return <ContextMenuPrimitive.Trigger {...props} />;
}

export function ContextMenuPortal(props: ComponentProps<typeof ContextMenuPrimitive.Portal>) {
  return <ContextMenuPrimitive.Portal {...props} />;
}

export function ContextMenuContent(props: ComponentProps<typeof ContextMenuPrimitive.Content>) {
  return <ContextMenuPrimitive.Content data-slot="context-menu-content" {...props} />;
}

export function ContextMenuItem(props: ComponentProps<typeof ContextMenuPrimitive.Item>) {
  return <ContextMenuPrimitive.Item data-slot="context-menu-item" {...props} />;
}

export function ContextMenuGroup(props: ComponentProps<typeof ContextMenuPrimitive.Group>) {
  return <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />;
}

export function ContextMenuLabel(props: ComponentProps<typeof ContextMenuPrimitive.Label>) {
  return <ContextMenuPrimitive.Label data-slot="context-menu-label" {...props} />;
}

export function ContextMenuCheckboxItem(props: ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>) {
  return <ContextMenuPrimitive.CheckboxItem data-slot="context-menu-checkbox-item" {...props} />;
}

/** Renders inside `ContextMenuCheckboxItem`/`ContextMenuRadioItem` — visible only while checked (unless `forceMount`). */
export function ContextMenuItemIndicator(props: ComponentProps<typeof ContextMenuPrimitive.ItemIndicator>) {
  return <ContextMenuPrimitive.ItemIndicator data-slot="context-menu-item-indicator" {...props} />;
}

export function ContextMenuRadioGroup(props: ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) {
  return <ContextMenuPrimitive.RadioGroup data-slot="context-menu-radio-group" {...props} />;
}

export function ContextMenuRadioItem(props: ComponentProps<typeof ContextMenuPrimitive.RadioItem>) {
  return <ContextMenuPrimitive.RadioItem data-slot="context-menu-radio-item" {...props} />;
}

export function ContextMenuSeparator(props: ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return <ContextMenuPrimitive.Separator data-slot="context-menu-separator" {...props} />;
}

/** Groups a `ContextMenuSubTrigger` with its `ContextMenuSubContent` — a submenu's own `Root`, same reasoning as `ContextMenu` itself. */
export function ContextMenuSub(props: ComponentProps<typeof ContextMenuPrimitive.Sub>) {
  return <ContextMenuPrimitive.Sub {...props} />;
}

export function ContextMenuSubTrigger(props: ComponentProps<typeof ContextMenuPrimitive.SubTrigger>) {
  return <ContextMenuPrimitive.SubTrigger data-slot="context-menu-sub-trigger" {...props} />;
}

export function ContextMenuSubContent(props: ComponentProps<typeof ContextMenuPrimitive.SubContent>) {
  return <ContextMenuPrimitive.SubContent data-slot="context-menu-sub-content" {...props} />;
}
