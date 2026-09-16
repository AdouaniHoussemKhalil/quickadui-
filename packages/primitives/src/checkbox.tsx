"use client";

import { Checkbox as CheckboxPrimitive } from "radix-ui";
import type { ComponentProps } from "react";

/**
 * A thin adapter over Radix UI's Checkbox primitive — see `dialog.tsx` for
 * why this package re-exports rather than lets consumers import `radix-ui`
 * directly, and `slot.tsx` for why every part below is a real function
 * component over `ComponentProps<typeof X>` rather than a raw value
 * re-export.
 *
 * Unlike `DialogPrimitive.Root`, `CheckboxRoot` *is* a real, always-visible
 * DOM node (a `<button role="checkbox">`) — QuickadUI's own checkbox
 * button, not a state manager a consumer composes into — so, like
 * `Tabs`/`TabsTrigger`, it gets a `data-slot`. `CheckboxIndicator` renders
 * the check/indeterminate mark inside it and gets one too.
 */
export function CheckboxRoot(props: ComponentProps<typeof CheckboxPrimitive.Root>) {
  return <CheckboxPrimitive.Root data-slot="checkbox" {...props} />;
}

export function CheckboxIndicator(props: ComponentProps<typeof CheckboxPrimitive.Indicator>) {
  return <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" {...props} />;
}
