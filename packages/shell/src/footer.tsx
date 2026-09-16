"use client";

import { cn } from "@quickadui/utils";
import type { ComponentProps } from "react";

/** A `DashboardLayout`'s bottom slot — sits under the scrollable body, inside the content column (not spanning the sidebar too), the common admin-dashboard placement. Also usable standalone, outside `DashboardLayout`. */
export function Footer({ className, ...props }: ComponentProps<"footer">) {
  return (
    <footer
      data-slot="footer"
      className={cn("flex h-12 shrink-0 items-center justify-between border-t border-neutral-6 px-4 text-xs text-neutral-11", className)}
      {...props}
    />
  );
}
