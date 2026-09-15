"use client";

import { Slot } from "@quickadui/primitives";
import { cn } from "@quickadui/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ElementType } from "react";

export const typographyVariants = cva("text-neutral-12", {
  variants: {
    variant: {
      h1: "scroll-m-20 text-4xl font-bold tracking-tight",
      h2: "scroll-m-20 text-3xl font-semibold tracking-tight",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight",
      body: "text-base leading-7",
      lead: "text-xl text-neutral-11",
      small: "text-sm font-medium leading-none",
      muted: "text-sm text-neutral-11",
    },
  },
  defaultVariants: {
    variant: "body",
  },
});

type TypographyVariant = NonNullable<VariantProps<typeof typographyVariants>["variant"]>;

/** The semantically-appropriate tag for each variant, used unless `as` overrides it. */
const DEFAULT_TAG: Record<TypographyVariant, ElementType> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  body: "p",
  lead: "p",
  small: "small",
  muted: "p",
};

export interface TypographyProps extends ComponentProps<"p">, VariantProps<typeof typographyVariants> {
  /** Merge these props onto the single child instead of rendering the default element for `variant`. */
  asChild?: boolean;
  /**
   * Override the rendered tag independent of `variant`'s default — e.g.
   * `variant="h1" as="div"` for something that should look like a heading
   * without claiming to be one in the document outline.
   */
  as?: ElementType;
}

export function Typography({ className, variant, asChild, as, ...props }: TypographyProps) {
  const resolvedVariant = variant ?? "body";
  const Comp = asChild ? Slot : (as ?? DEFAULT_TAG[resolvedVariant]);
  return <Comp data-slot="typography" className={cn(typographyVariants({ variant }), className)} {...props} />;
}
