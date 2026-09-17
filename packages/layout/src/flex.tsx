import { cn } from "@quickadui/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ElementType } from "react";

/**
 * The general-purpose flexbox primitive every other layout component here
 * either wraps (`Stack`) or sits alongside (`Grid`, `Container`,
 * `Section`). `gap` uses the same scale across all of them — see this
 * package's README for the full mapping.
 */
export const flexVariants = cva("flex", {
  variants: {
    direction: {
      row: "flex-row",
      column: "flex-col",
      "row-reverse": "flex-row-reverse",
      "column-reverse": "flex-col-reverse",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
      baseline: "items-baseline",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
      evenly: "justify-evenly",
    },
    wrap: {
      nowrap: "flex-nowrap",
      wrap: "flex-wrap",
      "wrap-reverse": "flex-wrap-reverse",
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
    direction: "row",
    align: "stretch",
    justify: "start",
    wrap: "nowrap",
    gap: "none",
  },
});

export interface FlexProps extends ComponentProps<"div">, VariantProps<typeof flexVariants> {
  /** Render as a different element/component than the default `<div>` — e.g. `as="header"`, `as="ul"`. Props are still typed against `<div>`'s, same tradeoff `Typography`'s `as` makes. */
  as?: ElementType;
}

export function Flex({
  className,
  direction,
  align,
  justify,
  wrap,
  gap,
  as: Comp = "div",
  ...props
}: FlexProps) {
  return (
    <Comp
      data-slot="flex"
      className={cn(flexVariants({ direction, align, justify, wrap, gap }), className)}
      {...props}
    />
  );
}
