"use client";

import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "@quickadui/icons";
import {
  Select as SelectPrimitive,
  SelectContent as SelectContentPrimitive,
  SelectGroup as SelectGroupPrimitive,
  SelectIcon as SelectIconPrimitive,
  SelectItem as SelectItemPrimitive,
  SelectItemIndicator as SelectItemIndicatorPrimitive,
  SelectItemText as SelectItemTextPrimitive,
  SelectLabel as SelectLabelPrimitive,
  SelectPortal as SelectPortalPrimitive,
  SelectScrollDownButton as SelectScrollDownButtonPrimitive,
  SelectScrollUpButton as SelectScrollUpButtonPrimitive,
  SelectSeparator as SelectSeparatorPrimitive,
  SelectTrigger as SelectTriggerPrimitive,
  SelectValue as SelectValuePrimitive,
  SelectViewport as SelectViewportPrimitive,
} from "@quickadui/primitives";
import { cn } from "@quickadui/utils";
import type { ComponentProps } from "react";

/**
 * Styled Select — composes `@quickadui/primitives`' Select parts.
 * `Select`/`SelectGroup`/`SelectValue` are re-exported as-is (no styling
 * to add); `SelectTrigger` bakes in the chevron icon, `SelectContent`
 * bakes in the portal and the scroll-up/down buttons, `SelectItem` bakes
 * in the check-mark indicator. Uses "popper" positioning (not Radix's
 * `item-aligned` default) — the trigger-width/height CSS variables it
 * exposes are what let `SelectContent` match the trigger's width.
 */
export function Select(props: ComponentProps<typeof SelectPrimitive>) {
  return <SelectPrimitive {...props} />;
}

export function SelectGroup(props: ComponentProps<typeof SelectGroupPrimitive>) {
  return <SelectGroupPrimitive {...props} />;
}

export function SelectValue(props: ComponentProps<typeof SelectValuePrimitive>) {
  return <SelectValuePrimitive {...props} />;
}

export function SelectTrigger({ className, children, ...props }: ComponentProps<typeof SelectTriggerPrimitive>) {
  return (
    <SelectTriggerPrimitive
      className={cn(
        "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-neutral-7 bg-neutral-1 px-3 text-sm text-neutral-12 shadow-sm outline-none transition-colors focus-visible:border-accent-8 focus-visible:ring-2 focus-visible:ring-accent-8/30 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-neutral-9 [&>span]:line-clamp-1",
        className,
      )}
      {...props}
    >
      {children}
      <SelectIconPrimitive asChild>
        <ChevronDownIcon size={16} className="shrink-0 opacity-60" />
      </SelectIconPrimitive>
    </SelectTriggerPrimitive>
  );
}

export function SelectContent({
  className,
  children,
  position = "popper",
  sideOffset = 4,
  ...props
}: ComponentProps<typeof SelectContentPrimitive>) {
  return (
    <SelectPortalPrimitive>
      <SelectContentPrimitive
        position={position}
        sideOffset={sideOffset}
        className={cn(
          "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-neutral-6 bg-neutral-1 text-neutral-12 shadow-md",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1",
          className,
        )}
        {...props}
      >
        <SelectScrollUpButtonPrimitive className="flex h-6 cursor-default items-center justify-center">
          <ChevronUpIcon size={14} />
        </SelectScrollUpButtonPrimitive>
        <SelectViewportPrimitive
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
          )}
        >
          {children}
        </SelectViewportPrimitive>
        <SelectScrollDownButtonPrimitive className="flex h-6 cursor-default items-center justify-center">
          <ChevronDownIcon size={14} />
        </SelectScrollDownButtonPrimitive>
      </SelectContentPrimitive>
    </SelectPortalPrimitive>
  );
}

export function SelectLabel({ className, ...props }: ComponentProps<typeof SelectLabelPrimitive>) {
  return <SelectLabelPrimitive className={cn("px-2 py-1.5 text-sm font-medium text-neutral-11", className)} {...props} />;
}

export function SelectItem({ className, children, ...props }: ComponentProps<typeof SelectItemPrimitive>) {
  return (
    <SelectItemPrimitive
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent-3 focus:text-accent-11 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex size-4 items-center justify-center">
        <SelectItemIndicatorPrimitive>
          <CheckIcon size={14} />
        </SelectItemIndicatorPrimitive>
      </span>
      <SelectItemTextPrimitive>{children}</SelectItemTextPrimitive>
    </SelectItemPrimitive>
  );
}

export function SelectSeparator({ className, ...props }: ComponentProps<typeof SelectSeparatorPrimitive>) {
  return <SelectSeparatorPrimitive className={cn("-mx-1 my-1 h-px bg-neutral-6", className)} {...props} />;
}
