"use client";

import { Slot } from "@quickadui/primitives";
import { cn } from "@quickadui/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

/**
 * Class names reference the semantic color scales from `@quickadui/tokens`
 * (via the `@theme` mapping in `@quickadui/theme`) — step 9 is always the
 * solid brand color, 3/4 the soft interactive background, 7 the outline
 * border, 11 the text color at that intensity. See the QuickadUI Blueprint,
 * §7, for the step numbering.
 *
 * `text-white` on the solid variants is a simplification: it reads fine
 * against this palette's specific accent/danger seeds (both mid-to-dark),
 * but a seed light enough to fail contrast against white wouldn't be
 * caught here — a real fix is a computed per-scale contrast token in
 * `@quickadui/tokens`, not yet built.
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-8 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        solid: "bg-accent-9 text-white hover:bg-accent-10",
        soft: "bg-accent-3 text-accent-11 hover:bg-accent-4",
        outline: "border border-accent-7 bg-transparent text-accent-11 hover:bg-accent-3",
        ghost: "bg-transparent text-accent-11 hover:bg-accent-3",
        destructive: "bg-danger-9 text-white hover:bg-danger-10",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "md",
    },
  },
);

export interface ButtonProps extends ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  /** Merge these props onto the single child instead of rendering a `<button>` — see `@quickadui/primitives`' `Slot`. */
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
