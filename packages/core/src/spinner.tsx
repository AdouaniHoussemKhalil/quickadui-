import { cn } from "@quickadui/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

export const spinnerVariants = cva("animate-spin text-accent-9", {
  variants: {
    size: {
      sm: "size-4",
      md: "size-6",
      lg: "size-8",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface SpinnerProps extends ComponentProps<"svg">, VariantProps<typeof spinnerVariants> {
  /** Announced to screen readers while the spinner is visible (it's the only accessible description — the SVG itself is `aria-hidden`). */
  label?: string;
}

export function Spinner({ className, size, label = "Loading", ...props }: SpinnerProps) {
  return (
    <span data-slot="spinner" role="status" className="inline-flex">
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={cn(spinnerVariants({ size }), className)} {...props}>
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}
