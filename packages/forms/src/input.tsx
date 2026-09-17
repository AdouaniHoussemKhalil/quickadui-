"use client";

import { cn } from "@quickadui/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

/**
 * The cva variant is named `inputSize`, not `size` — the native `<input>`
 * element already has its own `size` attribute (a number, the visible
 * character width), and this way `<Input size={20} inputSize="lg" />`
 * stays unambiguous instead of one meaning shadowing the other.
 */
export const inputVariants = cva(
  "flex w-full rounded-md border bg-neutral-1 px-3 text-sm text-neutral-12 shadow-sm outline-none transition-colors placeholder:text-neutral-9 disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium",
  {
    variants: {
      inputSize: {
        sm: "h-8 text-xs",
        md: "h-10",
        lg: "h-12 text-base",
      },
      state: {
        default:
          "border-neutral-7 focus-visible:border-accent-8 focus-visible:ring-2 focus-visible:ring-accent-8/30",
        error:
          "border-danger-7 focus-visible:border-danger-8 focus-visible:ring-2 focus-visible:ring-danger-8/30",
      },
    },
    defaultVariants: {
      inputSize: "md",
      state: "default",
    },
  },
);

export interface InputProps extends ComponentProps<"input">, VariantProps<typeof inputVariants> {}

export function Input({ className, inputSize, state, ...props }: InputProps) {
  return (
    <input
      data-slot="input"
      className={cn(inputVariants({ inputSize, state }), className)}
      {...props}
    />
  );
}
