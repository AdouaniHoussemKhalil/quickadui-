"use client";

import { SwitchRoot as SwitchRootPrimitive, SwitchThumb as SwitchThumbPrimitive } from "@quickadui/primitives";
import { cn } from "@quickadui/utils";
import type { ComponentProps } from "react";

export function Switch({ className, ...props }: ComponentProps<typeof SwitchRootPrimitive>) {
  return (
    <SwitchRootPrimitive
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-8 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=unchecked]:bg-neutral-6 data-[state=checked]:bg-accent-9",
        className,
      )}
      {...props}
    >
      <SwitchThumbPrimitive className="pointer-events-none block size-4 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=unchecked]:translate-x-0.5 data-[state=checked]:translate-x-[18px]" />
    </SwitchRootPrimitive>
  );
}
