import { cn } from "@quickadui/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ElementType } from "react";

/**
 * `columns` is a fixed set of common column counts (1/2/3/4/6/12), not an
 * arbitrary number — CSS utility classes have to exist ahead of time for
 * Tailwind to generate them (see `apps/playground/README.md`'s `@source`
 * gotcha for what happens when a class only exists as a runtime-computed
 * string nothing ever scans). A layout that genuinely needs a column
 * count outside this set should use `className` directly with an
 * arbitrary-value utility (`grid-cols-[7]`) instead.
 */
export const gridVariants = cva("grid", {
  variants: {
    columns: {
      "1": "grid-cols-1",
      "2": "grid-cols-2",
      "3": "grid-cols-3",
      "4": "grid-cols-4",
      "6": "grid-cols-6",
      "12": "grid-cols-12",
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
    columns: "1",
    gap: "md",
  },
});

export interface GridProps extends ComponentProps<"div">, VariantProps<typeof gridVariants> {
  /** Render as a different element/component than the default `<div>` — e.g. `as="ul"` for a semantic grid of list items. Props are still typed against `<div>`'s, same tradeoff `Typography`'s `as` makes. */
  as?: ElementType;
}

export function Grid({ className, columns, gap, as: Comp = "div", ...props }: GridProps) {
  return <Comp data-slot="grid" className={cn(gridVariants({ columns, gap }), className)} {...props} />;
}
