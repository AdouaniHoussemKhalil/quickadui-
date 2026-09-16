import { cn } from "@quickadui/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ElementType } from "react";

/**
 * Sugar over the same flexbox primitive as `Flex`, defaulting to a
 * vertical stack (`direction: "column"`, `gap: "md"`) instead of `Flex`'s
 * horizontal, gap-less defaults — for the common case of "these things,
 * spaced out, one under the other." Pass `direction="row"` to lay it out
 * horizontally instead of reaching for `Flex` directly; anything beyond
 * direction/align/gap (justify, wrap, ...) is what `Flex` itself is for.
 */
export const stackVariants = cva("flex", {
  variants: {
    direction: {
      row: "flex-row",
      column: "flex-col",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
    },
    gap: {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
      "2xl": "gap-12",
    },
  },
  defaultVariants: {
    direction: "column",
    align: "stretch",
    gap: "md",
  },
});

export interface StackProps extends ComponentProps<"div">, VariantProps<typeof stackVariants> {
  /** Render as a different element/component than the default `<div>` — e.g. `as="section"`, `as="ul"`. Props are still typed against `<div>`'s, same tradeoff `Typography`'s `as` makes. */
  as?: ElementType;
}

export function Stack({ className, direction, align, gap, as: Comp = "div", ...props }: StackProps) {
  return <Comp data-slot="stack" className={cn(stackVariants({ direction, align, gap }), className)} {...props} />;
}
