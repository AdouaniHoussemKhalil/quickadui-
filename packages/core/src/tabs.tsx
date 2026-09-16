"use client";

import {
  Tabs as TabsPrimitive,
  TabsContent as TabsContentPrimitive,
  TabsList as TabsListPrimitive,
  TabsTrigger as TabsTriggerPrimitive,
} from "@quickadui/primitives";
import { cn } from "@quickadui/utils";
import type { ComponentProps } from "react";

/**
 * Styled Tabs — composes `@quickadui/primitives`' Tabs parts with
 * QuickadUI's default chrome. Unlike an overlay's Trigger, `TabsTrigger`
 * *is* QuickadUI's own visible tab button, so every part here gets real
 * styling (not just a pass-through), matching the primitives layer's
 * every-part-gets-a-slot reasoning.
 */
export function Tabs(props: ComponentProps<typeof TabsPrimitive>) {
  return <TabsPrimitive {...props} />;
}

export function TabsList({ className, ...props }: ComponentProps<typeof TabsListPrimitive>) {
  return (
    <TabsListPrimitive
      className={cn("inline-flex h-10 items-center justify-center rounded-md bg-neutral-3 p-1 text-neutral-11", className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsTriggerPrimitive>) {
  return (
    <TabsTriggerPrimitive
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-8 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-neutral-1 data-[state=active]:text-neutral-12 data-[state=active]:shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: ComponentProps<typeof TabsContentPrimitive>) {
  return (
    <TabsContentPrimitive
      className={cn("mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-8 focus-visible:ring-offset-2", className)}
      {...props}
    />
  );
}
