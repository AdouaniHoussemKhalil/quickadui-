"use client";

import { cn } from "@quickadui/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

export const textareaVariants = cva(
  "flex min-h-[80px] w-full rounded-md border bg-neutral-1 px-3 py-2 text-sm text-neutral-12 shadow-sm outline-none transition-colors placeholder:text-neutral-9 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      state: {
        default:
          "border-neutral-7 focus-visible:border-accent-8 focus-visible:ring-2 focus-visible:ring-accent-8/30",
        error:
          "border-danger-7 focus-visible:border-danger-8 focus-visible:ring-2 focus-visible:ring-danger-8/30",
      },
    },
    defaultVariants: {
      state: "default",
    },
  },
);

export interface TextareaProps
  extends ComponentProps<"textarea">,
    VariantProps<typeof textareaVariants> {}

export function Textarea({ className, state, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(textareaVariants({ state }), className)}
      {...props}
    />
  );
}
