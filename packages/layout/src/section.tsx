import { cn } from "@quickadui/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

/**
 * A `<section>` with vertical rhythm baked in — the unit a page is
 * usually built out of (hero, features, footer, ...), each one getting
 * consistent top/bottom breathing room regardless of what's inside it.
 * Renders a real `<section>` (not a `<div>`) since it's meant to mark an
 * actual document section, not just add spacing — wrap it in `Container`
 * for horizontal centering/max-width, they're independent concerns.
 */
export const sectionVariants = cva("w-full", {
  variants: {
    spacing: {
      sm: "py-8",
      md: "py-12",
      lg: "py-16",
      xl: "py-24",
    },
  },
  defaultVariants: {
    spacing: "md",
  },
});

export interface SectionProps
  extends ComponentProps<"section">,
    VariantProps<typeof sectionVariants> {}

export function Section({ className, spacing, ...props }: SectionProps) {
  return (
    <section
      data-slot="section"
      className={cn(sectionVariants({ spacing }), className)}
      {...props}
    />
  );
}
