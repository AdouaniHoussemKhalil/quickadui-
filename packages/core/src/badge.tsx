"use client";

import { Slot } from "@quickadui/primitives";
import { cn } from "@quickadui/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        solid: "border-transparent bg-accent-9 text-white",
        soft: "border-transparent bg-accent-3 text-accent-11",
        outline: "border-accent-7 text-accent-11",
        success: "border-transparent bg-success-3 text-success-11",
        warning: "border-transparent bg-warning-3 text-warning-11",
        danger: "border-transparent bg-danger-3 text-danger-11",
      },
    },
    defaultVariants: {
      variant: "soft",
    },
  },
);

export interface BadgeProps extends ComponentProps<"span">, VariantProps<typeof badgeVariants> {
  /** Merge these props onto the single child instead of rendering a `<span>` — e.g. a tag badge that's also a link. */
  asChild?: boolean;
}

export function Badge({ className, variant, asChild, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
