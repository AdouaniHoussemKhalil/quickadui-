"use client";

import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "@quickadui/icons";
import { cn } from "@quickadui/utils";
import { cva } from "class-variance-authority";
import type { ComponentProps } from "react";

export function Pagination({ className, ...props }: ComponentProps<"nav">) {
  return (
    <nav
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

export function PaginationContent({ className, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

export function PaginationItem(props: ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

/**
 * `state`, not a `{ true, false }` boolean variant key — same reasoning
 * as `table.tsx`'s `tableRowVariants`: the local cva stub doesn't
 * replicate cva's real boolean-key-to-`boolean`-prop inference, so
 * `PaginationLink`'s public `isActive` prop is a hand-declared `boolean`
 * that converts to this variant internally instead.
 */
export const paginationLinkVariants = cva(
  "inline-flex size-9 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-neutral-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-8 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      state: {
        default: "text-neutral-12",
        active: "bg-accent-9 text-white hover:bg-accent-10",
      },
    },
    defaultVariants: {
      state: "default",
    },
  },
);

export interface PaginationLinkProps extends ComponentProps<"button"> {
  isActive?: boolean;
}

export function PaginationLink({ className, isActive, ...props }: PaginationLinkProps) {
  return (
    <button
      type="button"
      data-slot="pagination-link"
      aria-current={isActive ? "page" : undefined}
      className={cn(paginationLinkVariants({ state: isActive ? "active" : "default" }), className)}
      {...props}
    />
  );
}

export function PaginationPrevious({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="pagination-previous"
      aria-label="Go to previous page"
      className={cn(paginationLinkVariants({ state: "default" }), "gap-1 px-2.5", className)}
      {...props}
    >
      <ChevronLeftIcon size={16} />
      <span className="hidden sm:inline">Previous</span>
    </button>
  );
}

export function PaginationNext({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="pagination-next"
      aria-label="Go to next page"
      className={cn(paginationLinkVariants({ state: "default" }), "gap-1 px-2.5", className)}
      {...props}
    >
      <span className="hidden sm:inline">Next</span>
      <ChevronRightIcon size={16} />
    </button>
  );
}

export function PaginationEllipsis({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon size={16} />
      <span className="sr-only">More pages</span>
    </span>
  );
}
