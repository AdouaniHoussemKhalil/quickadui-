"use client";

import { cn } from "@quickadui/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

export function Timeline({ className, ...props }: ComponentProps<"ol">) {
  return <ol data-slot="timeline" className={cn("flex flex-col", className)} {...props} />;
}

export function TimelineItem({ className, ...props }: ComponentProps<"li">) {
  return (
    <li
      data-slot="timeline-item"
      className={cn("relative flex gap-4 pb-8 last:pb-0", className)}
      {...props}
    />
  );
}

/** The dot-and-connecting-line column, to the left of `TimelineContent` — contains a `TimelineDot` and, for every item but the last, a `TimelineConnector`. */
export function TimelineSeparator({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-separator"
      className={cn("flex flex-col items-center", className)}
      {...props}
    />
  );
}

export const timelineDotVariants = cva(
  "z-10 size-3 shrink-0 rounded-full border-2 border-neutral-1 ring-2",
  {
    variants: {
      variant: {
        default: "bg-neutral-9 ring-neutral-6",
        accent: "bg-accent-9 ring-accent-9",
        success: "bg-success-9 ring-success-9",
        warning: "bg-warning-9 ring-warning-9",
        danger: "bg-danger-9 ring-danger-9",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface TimelineDotProps
  extends ComponentProps<"span">,
    VariantProps<typeof timelineDotVariants> {}

export function TimelineDot({ className, variant, ...props }: TimelineDotProps) {
  return (
    <span
      data-slot="timeline-dot"
      className={cn(timelineDotVariants({ variant }), className)}
      {...props}
    />
  );
}

export function TimelineConnector({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-connector"
      className={cn("w-px flex-1 bg-neutral-6", className)}
      {...props}
    />
  );
}

export function TimelineContent({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="timeline-content" className={cn("flex-1 pt-0.5", className)} {...props} />;
}
