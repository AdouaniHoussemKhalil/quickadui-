"use client";

import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import type { ComponentProps } from "react";

/**
 * A thin adapter over Radix UI's RadioGroup primitive. `RadioGroupRoot`
 * renders the `role="radiogroup"` container and `RadioGroupItem` each
 * `<button role="radio">` — both are real, always-visible DOM QuickadUI
 * styles by default, so both get a `data-slot`, same reasoning as
 * `checkbox.tsx`/`switch.tsx`. `RadioGroupIndicator` (the filled dot shown
 * inside a checked item) gets one too.
 */
export function RadioGroupRoot(props: ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root data-slot="radio-group" {...props} />;
}

export function RadioGroupItem(props: ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return <RadioGroupPrimitive.Item data-slot="radio-group-item" {...props} />;
}

export function RadioGroupIndicator(props: ComponentProps<typeof RadioGroupPrimitive.Indicator>) {
  return <RadioGroupPrimitive.Indicator data-slot="radio-group-indicator" {...props} />;
}
