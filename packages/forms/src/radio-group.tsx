"use client";

import { CircleIcon } from "@quickadui/icons";
import {
  RadioGroupIndicator as RadioGroupIndicatorPrimitive,
  RadioGroupItem as RadioGroupItemPrimitive,
  RadioGroupRoot as RadioGroupRootPrimitive,
} from "@quickadui/primitives";
import { cn } from "@quickadui/utils";
import type { ComponentProps } from "react";

export function RadioGroup({
  className,
  ...props
}: ComponentProps<typeof RadioGroupRootPrimitive>) {
  return <RadioGroupRootPrimitive className={cn("grid gap-2", className)} {...props} />;
}

export function RadioGroupItem({
  className,
  ...props
}: ComponentProps<typeof RadioGroupItemPrimitive>) {
  return (
    <RadioGroupItemPrimitive
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-full border border-neutral-7 bg-neutral-1 shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-8 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-accent-9",
        className,
      )}
      {...props}
    >
      <RadioGroupIndicatorPrimitive className="flex items-center justify-center">
        <CircleIcon size={8} className="fill-accent-9 text-accent-9" />
      </RadioGroupIndicatorPrimitive>
    </RadioGroupItemPrimitive>
  );
}
