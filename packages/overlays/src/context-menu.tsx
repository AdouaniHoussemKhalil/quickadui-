"use client";

import {
  ContextMenu as ContextMenuPrimitive,
  ContextMenuCheckboxItem as ContextMenuCheckboxItemPrimitive,
  ContextMenuContent as ContextMenuContentPrimitive,
  ContextMenuGroup as ContextMenuGroupPrimitive,
  ContextMenuItem as ContextMenuItemPrimitive,
  ContextMenuItemIndicator as ContextMenuItemIndicatorPrimitive,
  ContextMenuLabel as ContextMenuLabelPrimitive,
  ContextMenuPortal as ContextMenuPortalPrimitive,
  ContextMenuRadioGroup as ContextMenuRadioGroupPrimitive,
  ContextMenuRadioItem as ContextMenuRadioItemPrimitive,
  ContextMenuSeparator as ContextMenuSeparatorPrimitive,
  ContextMenuSub as ContextMenuSubPrimitive,
  ContextMenuSubContent as ContextMenuSubContentPrimitive,
  ContextMenuSubTrigger as ContextMenuSubTriggerPrimitive,
  ContextMenuTrigger as ContextMenuTriggerPrimitive,
} from "@quickadui/primitives";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "@quickadui/icons";
import { cn } from "@quickadui/utils";
import type { ComponentProps } from "react";

/**
 * Styled ContextMenu — composes `@quickadui/primitives`' ContextMenu
 * parts with the exact same visual language `@quickadui/core`'s
 * `DropdownMenu` uses (same class strings, deliberately, for a
 * consistent "menu" look across the whole library regardless of how it
 * opens). `ContextMenu`/`ContextMenuTrigger`/`ContextMenuGroup`/
 * `ContextMenuSub`/`ContextMenuRadioGroup` are re-exported as-is;
 * `ContextMenuContent`/`ContextMenuSubContent` bake in the portal.
 */
export function ContextMenu(props: ComponentProps<typeof ContextMenuPrimitive>) {
  return <ContextMenuPrimitive {...props} />;
}

export function ContextMenuTrigger(props: ComponentProps<typeof ContextMenuTriggerPrimitive>) {
  return <ContextMenuTriggerPrimitive {...props} />;
}

export function ContextMenuGroup(props: ComponentProps<typeof ContextMenuGroupPrimitive>) {
  return <ContextMenuGroupPrimitive {...props} />;
}

export function ContextMenuSub(props: ComponentProps<typeof ContextMenuSubPrimitive>) {
  return <ContextMenuSubPrimitive {...props} />;
}

export function ContextMenuRadioGroup(props: ComponentProps<typeof ContextMenuRadioGroupPrimitive>) {
  return <ContextMenuRadioGroupPrimitive {...props} />;
}

export function ContextMenuContent({ className, ...props }: ComponentProps<typeof ContextMenuContentPrimitive>) {
  return (
    <ContextMenuPortalPrimitive>
      <ContextMenuContentPrimitive
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-md border border-neutral-6 bg-neutral-1 p-1 text-neutral-12 shadow-md",
          className,
        )}
        {...props}
      />
    </ContextMenuPortalPrimitive>
  );
}

const contextMenuItemClassName =
  "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent-3 focus:text-accent-11 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0";

export function ContextMenuItem({ className, ...props }: ComponentProps<typeof ContextMenuItemPrimitive>) {
  return <ContextMenuItemPrimitive className={cn(contextMenuItemClassName, className)} {...props} />;
}

export function ContextMenuSubTrigger({ className, children, ...props }: ComponentProps<typeof ContextMenuSubTriggerPrimitive>) {
  return (
    <ContextMenuSubTriggerPrimitive
      className={cn(contextMenuItemClassName, "data-[state=open]:bg-accent-3 data-[state=open]:text-accent-11", className)}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </ContextMenuSubTriggerPrimitive>
  );
}

export function ContextMenuSubContent({ className, ...props }: ComponentProps<typeof ContextMenuSubContentPrimitive>) {
  return (
    <ContextMenuPortalPrimitive>
      <ContextMenuSubContentPrimitive
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-md border border-neutral-6 bg-neutral-1 p-1 text-neutral-12 shadow-md",
          className,
        )}
        {...props}
      />
    </ContextMenuPortalPrimitive>
  );
}

export function ContextMenuCheckboxItem({ className, children, ...props }: ComponentProps<typeof ContextMenuCheckboxItemPrimitive>) {
  return (
    <ContextMenuCheckboxItemPrimitive className={cn(contextMenuItemClassName, "pl-8", className)} {...props}>
      <span className="absolute left-2 flex size-4 items-center justify-center">
        <ContextMenuItemIndicatorPrimitive>
          <CheckIcon className="size-4" />
        </ContextMenuItemIndicatorPrimitive>
      </span>
      {children}
    </ContextMenuCheckboxItemPrimitive>
  );
}

export function ContextMenuRadioItem({ className, children, ...props }: ComponentProps<typeof ContextMenuRadioItemPrimitive>) {
  return (
    <ContextMenuRadioItemPrimitive className={cn(contextMenuItemClassName, "pl-8", className)} {...props}>
      <span className="absolute left-2 flex size-4 items-center justify-center">
        <ContextMenuItemIndicatorPrimitive>
          <CircleIcon className="size-2" />
        </ContextMenuItemIndicatorPrimitive>
      </span>
      {children}
    </ContextMenuRadioItemPrimitive>
  );
}

export function ContextMenuLabel({ className, ...props }: ComponentProps<typeof ContextMenuLabelPrimitive>) {
  return <ContextMenuLabelPrimitive className={cn("px-2 py-1.5 text-sm font-medium text-neutral-11", className)} {...props} />;
}

export function ContextMenuSeparator({ className, ...props }: ComponentProps<typeof ContextMenuSeparatorPrimitive>) {
  return <ContextMenuSeparatorPrimitive className={cn("-mx-1 my-1 h-px bg-neutral-6", className)} {...props} />;
}

/** Cosmetic only — not derived from any Radix part, a right-aligned hint (e.g. a keyboard shortcut) inside a `ContextMenuItem`. Same as `@quickadui/core`'s `DropdownMenuShortcut`. */
export function ContextMenuShortcut({ className, ...props }: ComponentProps<"span">) {
  return <span className={cn("ml-auto text-xs tracking-widest text-neutral-11", className)} {...props} />;
}
