"use client";

import { cn } from "@quickadui/utils";
import { cva } from "class-variance-authority";
import type { ComponentProps } from "react";

/**
 * Plain, semantic `<table>` wrappers with QuickadUI's default chrome — no
 * Radix primitive involved (Radix doesn't have a Table primitive; native
 * table semantics are already fully accessible on their own, nothing to
 * wrap). A horizontally-scrollable container is baked into `Table` itself
 * so a wide table doesn't blow out its parent.
 */
export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

export function TableHeader({ className, ...props }: ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b [&_tr]:border-neutral-6", className)}
      {...props}
    />
  );
}

export function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

export function TableFooter({ className, ...props }: ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t border-neutral-6 bg-neutral-2 font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

/**
 * `TableRow`'s public `selected` prop is a plain `boolean`, not run
 * through `cva`'s own `{ true: ..., false: ... }` variant-key-to-boolean
 * inference — the local `class-variance-authority` stub used to validate
 * this monorepo doesn't replicate that (real cva-specific) type magic, so
 * relying on it here would validate locally while silently requiring
 * string `"true"`/`"false"` instead of real booleans, the same class of
 * stub/reality gap that broke two real builds earlier this project.
 * `state` is the actual cva variant (still fully tested below); the
 * public API converts to/from it internally.
 */
export const tableRowVariants = cva(
  "border-b border-neutral-6 transition-colors hover:bg-neutral-2",
  {
    variants: {
      state: {
        default: "",
        selected: "bg-accent-3 hover:bg-accent-3",
      },
    },
    defaultVariants: {
      state: "default",
    },
  },
);

export interface TableRowProps extends ComponentProps<"tr"> {
  selected?: boolean;
}

export function TableRow({ className, selected, ...props }: TableRowProps) {
  return (
    <tr
      data-slot="table-row"
      className={cn(tableRowVariants({ state: selected ? "selected" : "default" }), className)}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 whitespace-nowrap px-2 text-left align-middle text-sm font-medium text-neutral-11 [&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn("whitespace-nowrap p-2 align-middle [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  );
}

export function TableCaption({ className, ...props }: ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-neutral-11", className)}
      {...props}
    />
  );
}
