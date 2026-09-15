"use client";

import { Slot } from "@quickadui/primitives";
import { cn } from "@quickadui/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

export const iconButtonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-8 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        solid: "bg-accent-9 text-white hover:bg-accent-10",
        soft: "bg-accent-3 text-accent-11 hover:bg-accent-4",
        outline: "border border-accent-7 bg-transparent text-accent-11 hover:bg-accent-3",
        ghost: "bg-transparent text-accent-11 hover:bg-accent-3",
      },
      size: {
        sm: "size-8 [&_svg]:size-4",
        md: "size-10 [&_svg]:size-5",
        lg: "size-12 [&_svg]:size-6",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "md",
    },
  },
);

export interface IconButtonProps
  extends Omit<ComponentProps<"button">, "aria-label">,
    VariantProps<typeof iconButtonVariants> {
  asChild?: boolean;
  /**
   * Required, not optional: an icon-only button has no visible text, so
   * without this a screen reader announces nothing usable.
   */
  "aria-label": string;
}

export function IconButton({ className, variant, size, asChild, ...props }: IconButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="icon-button" className={cn(iconButtonVariants({ variant, size }), className)} {...props} />;
}
