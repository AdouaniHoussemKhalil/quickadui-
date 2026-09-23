"use client";

import { cn } from "@quickadui/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";

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

// Square icon-slot width per inputSize, matching that size's own height
// (h-8/h-10/h-12 above) so a start/end icon box is always visually square
// — and the matching padding so typed text never runs under it.
const iconSlotWidth: Record<"sm" | "md" | "lg", string> = {
  sm: "w-8",
  md: "w-10",
  lg: "w-12",
};
const startPadding: Record<"sm" | "md" | "lg", string> = {
  sm: "pl-8",
  md: "pl-10",
  lg: "pl-12",
};
const endPadding: Record<"sm" | "md" | "lg", string> = {
  sm: "pr-8",
  md: "pr-10",
  lg: "pr-12",
};

export interface InputProps extends ComponentProps<"input">, VariantProps<typeof inputVariants> {
  /**
   * Rendered inside the input's left edge (a search icon, a currency
   * symbol, ...). Reserves left padding automatically, sized to match
   * `inputSize` — don't add your own `pl-*` to `className`.
   */
  startIcon?: ReactNode;
  /**
   * Rendered inside the input's right edge (a status icon, a unit label,
   * an embedded `CopyButton`, ...). Reserves right padding automatically,
   * sized to match `inputSize` — don't add your own `pr-*` to `className`.
   * Interactive content (a button) works here too — the slot doesn't
   * block pointer events, unlike a purely decorative icon you might
   * otherwise expect to be click-through.
   */
  endIcon?: ReactNode;
}

export function Input({ className, inputSize, state, startIcon, endIcon, ...props }: InputProps) {
  if (!startIcon && !endIcon) {
    return (
      <input
        data-slot="input"
        className={cn(inputVariants({ inputSize, state }), className)}
        {...props}
      />
    );
  }

  const resolvedSize: "sm" | "md" | "lg" =
    (inputSize as "sm" | "md" | "lg" | null | undefined) ?? "md";

  return (
    <div className="relative w-full">
      <input
        data-slot="input"
        className={cn(
          inputVariants({ inputSize, state }),
          startIcon && startPadding[resolvedSize],
          endIcon && endPadding[resolvedSize],
          className,
        )}
        {...props}
      />
      {startIcon && (
        <span
          data-slot="input-start-icon"
          className={cn(
            "absolute inset-y-0 left-0 flex items-center justify-center text-neutral-9",
            iconSlotWidth[resolvedSize],
          )}
        >
          {startIcon}
        </span>
      )}
      {endIcon && (
        <span
          data-slot="input-end-icon"
          className={cn(
            "absolute inset-y-0 right-0 flex items-center justify-center text-neutral-9",
            iconSlotWidth[resolvedSize],
          )}
        >
          {endIcon}
        </span>
      )}
    </div>
  );
}
