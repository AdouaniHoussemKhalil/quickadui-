import { cn } from "@quickadui/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

/**
 * Centers content and caps its width — the outermost wrapper for a page's
 * content, as opposed to `Section` (vertical rhythm) or `Stack`/`Flex`/
 * `Grid` (arranging children). `maxWidth` deliberately uses the fixed
 * `max-w-*` scale (rem-based, e.g. `max-w-6xl` = 72rem) rather than the
 * `max-w-screen-*` one (tied to Tailwind's `screens` theme key, which
 * this project doesn't customize) — the fixed scale is guaranteed to
 * exist regardless of theme config.
 */
export const containerVariants = cva("mx-auto w-full px-4 sm:px-6 lg:px-8", {
  variants: {
    maxWidth: {
      sm: "max-w-3xl",
      md: "max-w-5xl",
      lg: "max-w-6xl",
      xl: "max-w-7xl",
      full: "max-w-none",
    },
  },
  defaultVariants: {
    maxWidth: "xl",
  },
});

export interface ContainerProps
  extends ComponentProps<"div">,
    VariantProps<typeof containerVariants> {}

export function Container({ className, maxWidth, ...props }: ContainerProps) {
  return (
    <div
      data-slot="container"
      className={cn(containerVariants({ maxWidth }), className)}
      {...props}
    />
  );
}
