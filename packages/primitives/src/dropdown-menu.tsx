"use client";

import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import type { ComponentProps } from "react";

/**
 * A thin adapter over Radix UI's DropdownMenu primitive — see `dialog.tsx`
 * for why this package re-exports rather than lets consumers import
 * `radix-ui` directly, and `slot.tsx` for why every part below is a real
 * function component over `ComponentProps<typeof X>` rather than a raw
 * value re-export.
 *
 * `DropdownMenuTrigger`/`Portal`/`Sub` get no `data-slot` — same reasoning
 * as `PopoverTrigger`/`Portal`: `Root`/`Sub`/`Portal` render no DOM node of
 * their own, and `Trigger` is almost always the consumer's own `Button`
 * composed in via `asChild`. `SubTrigger` is different: unlike the
 * top-level `Trigger`, it *is* a menu item (it opens a submenu instead of
 * closing/selecting), styled identically to `Item` — so it gets a slot.
 * Every other part renders QuickadUI's own default menu chrome and gets
 * one.
 */
export function DropdownMenu(props: ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root {...props} />;
}

export function DropdownMenuTrigger(props: ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return <DropdownMenuPrimitive.Trigger {...props} />;
}

export function DropdownMenuPortal(props: ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return <DropdownMenuPrimitive.Portal {...props} />;
}

export function DropdownMenuContent(props: ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return <DropdownMenuPrimitive.Content data-slot="dropdown-menu-content" {...props} />;
}

/** The little triangle pointing back at `DropdownMenuTrigger` — optional. */
export function DropdownMenuArrow(props: ComponentProps<typeof DropdownMenuPrimitive.Arrow>) {
  return <DropdownMenuPrimitive.Arrow data-slot="dropdown-menu-arrow" {...props} />;
}

export function DropdownMenuItem(props: ComponentProps<typeof DropdownMenuPrimitive.Item>) {
  return <DropdownMenuPrimitive.Item data-slot="dropdown-menu-item" {...props} />;
}

export function DropdownMenuGroup(props: ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

export function DropdownMenuLabel(props: ComponentProps<typeof DropdownMenuPrimitive.Label>) {
  return <DropdownMenuPrimitive.Label data-slot="dropdown-menu-label" {...props} />;
}

export function DropdownMenuCheckboxItem(
  props: ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>,
) {
  return <DropdownMenuPrimitive.CheckboxItem data-slot="dropdown-menu-checkbox-item" {...props} />;
}

/** Renders inside `DropdownMenuCheckboxItem`/`DropdownMenuRadioItem` — visible only while checked (unless `forceMount`). */
export function DropdownMenuItemIndicator(
  props: ComponentProps<typeof DropdownMenuPrimitive.ItemIndicator>,
) {
  return (
    <DropdownMenuPrimitive.ItemIndicator data-slot="dropdown-menu-item-indicator" {...props} />
  );
}

export function DropdownMenuRadioGroup(
  props: ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>,
) {
  return <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

export function DropdownMenuRadioItem(
  props: ComponentProps<typeof DropdownMenuPrimitive.RadioItem>,
) {
  return <DropdownMenuPrimitive.RadioItem data-slot="dropdown-menu-radio-item" {...props} />;
}

export function DropdownMenuSeparator(
  props: ComponentProps<typeof DropdownMenuPrimitive.Separator>,
) {
  return <DropdownMenuPrimitive.Separator data-slot="dropdown-menu-separator" {...props} />;
}

/** Groups a `DropdownMenuSubTrigger` with its `DropdownMenuSubContent` — a submenu's own `Root`, same reasoning as `DropdownMenu` itself. */
export function DropdownMenuSub(props: ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub {...props} />;
}

export function DropdownMenuSubTrigger(
  props: ComponentProps<typeof DropdownMenuPrimitive.SubTrigger>,
) {
  return <DropdownMenuPrimitive.SubTrigger data-slot="dropdown-menu-sub-trigger" {...props} />;
}

export function DropdownMenuSubContent(
  props: ComponentProps<typeof DropdownMenuPrimitive.SubContent>,
) {
  return <DropdownMenuPrimitive.SubContent data-slot="dropdown-menu-sub-content" {...props} />;
}
