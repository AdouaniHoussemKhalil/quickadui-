"use client";

import {
  DropdownMenuCheckboxItem as DropdownMenuCheckboxItemPrimitive,
  DropdownMenuContent as DropdownMenuContentPrimitive,
  DropdownMenuGroup as DropdownMenuGroupPrimitive,
  DropdownMenuItemIndicator as DropdownMenuItemIndicatorPrimitive,
  DropdownMenuItem as DropdownMenuItemPrimitive,
  DropdownMenuLabel as DropdownMenuLabelPrimitive,
  DropdownMenuPortal as DropdownMenuPortalPrimitive,
  DropdownMenu as DropdownMenuPrimitive,
  DropdownMenuRadioGroup as DropdownMenuRadioGroupPrimitive,
  DropdownMenuRadioItem as DropdownMenuRadioItemPrimitive,
  DropdownMenuSeparator as DropdownMenuSeparatorPrimitive,
  DropdownMenuSubContent as DropdownMenuSubContentPrimitive,
  DropdownMenuSub as DropdownMenuSubPrimitive,
  DropdownMenuSubTrigger as DropdownMenuSubTriggerPrimitive,
  DropdownMenuTrigger as DropdownMenuTriggerPrimitive,
} from "@quickadui/primitives";
import { cn } from "@quickadui/utils";
import type { ComponentProps } from "react";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "./_internal-icons";

/**
 * Styled DropdownMenu — composes `@quickadui/primitives`' DropdownMenu
 * parts with QuickadUI's default chrome. `DropdownMenu`/`DropdownMenuTrigger`/
 * `DropdownMenuGroup`/`DropdownMenuSub`/`DropdownMenuRadioGroup` are
 * re-exported as-is (no styling to add); `DropdownMenuContent` and
 * `DropdownMenuSubContent` bake in the portal, since QuickadUI always wants
 * one. `DropdownMenuShortcut` is cosmetic only — a plain `<span>`, not
 * derived from any Radix part.
 */
export function DropdownMenu(props: ComponentProps<typeof DropdownMenuPrimitive>) {
  return <DropdownMenuPrimitive {...props} />;
}

export function DropdownMenuTrigger(props: ComponentProps<typeof DropdownMenuTriggerPrimitive>) {
  return <DropdownMenuTriggerPrimitive {...props} />;
}

export function DropdownMenuGroup(props: ComponentProps<typeof DropdownMenuGroupPrimitive>) {
  return <DropdownMenuGroupPrimitive {...props} />;
}

export function DropdownMenuSub(props: ComponentProps<typeof DropdownMenuSubPrimitive>) {
  return <DropdownMenuSubPrimitive {...props} />;
}

export function DropdownMenuRadioGroup(
  props: ComponentProps<typeof DropdownMenuRadioGroupPrimitive>,
) {
  return <DropdownMenuRadioGroupPrimitive {...props} />;
}

export function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: ComponentProps<typeof DropdownMenuContentPrimitive>) {
  return (
    <DropdownMenuPortalPrimitive>
      <DropdownMenuContentPrimitive
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-md border border-neutral-6 bg-neutral-1 p-1 text-neutral-12 shadow-md",
          className,
        )}
        {...props}
      />
    </DropdownMenuPortalPrimitive>
  );
}

const dropdownMenuItemClassName =
  "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent-3 focus:text-accent-11 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0";

export function DropdownMenuItem({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuItemPrimitive>) {
  return (
    <DropdownMenuItemPrimitive className={cn(dropdownMenuItemClassName, className)} {...props} />
  );
}

export function DropdownMenuSubTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuSubTriggerPrimitive>) {
  return (
    <DropdownMenuSubTriggerPrimitive
      className={cn(
        dropdownMenuItemClassName,
        "data-[state=open]:bg-accent-3 data-[state=open]:text-accent-11",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </DropdownMenuSubTriggerPrimitive>
  );
}

export function DropdownMenuSubContent({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuSubContentPrimitive>) {
  return (
    <DropdownMenuPortalPrimitive>
      <DropdownMenuSubContentPrimitive
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-md border border-neutral-6 bg-neutral-1 p-1 text-neutral-12 shadow-md",
          className,
        )}
        {...props}
      />
    </DropdownMenuPortalPrimitive>
  );
}

export function DropdownMenuCheckboxItem({
  className,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuCheckboxItemPrimitive>) {
  return (
    <DropdownMenuCheckboxItemPrimitive
      className={cn(dropdownMenuItemClassName, "pl-8", className)}
      {...props}
    >
      <span className="absolute left-2 flex size-4 items-center justify-center">
        <DropdownMenuItemIndicatorPrimitive>
          <CheckIcon className="size-4" />
        </DropdownMenuItemIndicatorPrimitive>
      </span>
      {children}
    </DropdownMenuCheckboxItemPrimitive>
  );
}

export function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuRadioItemPrimitive>) {
  return (
    <DropdownMenuRadioItemPrimitive
      className={cn(dropdownMenuItemClassName, "pl-8", className)}
      {...props}
    >
      <span className="absolute left-2 flex size-4 items-center justify-center">
        <DropdownMenuItemIndicatorPrimitive>
          <CircleIcon className="size-2" />
        </DropdownMenuItemIndicatorPrimitive>
      </span>
      {children}
    </DropdownMenuRadioItemPrimitive>
  );
}

export function DropdownMenuLabel({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuLabelPrimitive>) {
  return (
    <DropdownMenuLabelPrimitive
      className={cn("px-2 py-1.5 text-sm font-medium text-neutral-11", className)}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuSeparatorPrimitive>) {
  return (
    <DropdownMenuSeparatorPrimitive
      className={cn("-mx-1 my-1 h-px bg-neutral-6", className)}
      {...props}
    />
  );
}

/** Cosmetic only — not derived from any Radix part, just a right-aligned hint (e.g. a keyboard shortcut) inside a `DropdownMenuItem`. */
export function DropdownMenuShortcut({ className, ...props }: ComponentProps<"span">) {
  return (
    <span className={cn("ml-auto text-xs tracking-widest text-neutral-11", className)} {...props} />
  );
}
