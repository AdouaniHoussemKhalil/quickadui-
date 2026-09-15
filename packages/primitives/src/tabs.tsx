"use client";

import { Tabs as TabsPrimitive } from "radix-ui";
import type { ComponentProps } from "react";

/**
 * A thin adapter over Radix UI's Tabs primitive — see `dialog.tsx` for why
 * this package re-exports rather than lets consumers import `radix-ui`
 * directly, and `slot.tsx` for why every part below is a real function
 * component over `ComponentProps<typeof X>` rather than a raw value
 * re-export.
 *
 * Unlike `PopoverTrigger`/`DialogTrigger`, `TabsTrigger` *is* QuickadUI's
 * own visible, always-styled tab button (not a generic thing-that-opens-an-
 * overlay a consumer composes their own `Button` into) — so every part here
 * gets a `data-slot`, `Root` included.
 */
export function Tabs(props: ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" {...props} />;
}

export function TabsList(props: ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List data-slot="tabs-list" {...props} />;
}

export function TabsTrigger(props: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return <TabsPrimitive.Trigger data-slot="tabs-trigger" {...props} />;
}

export function TabsContent(props: ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content data-slot="tabs-content" {...props} />;
}
