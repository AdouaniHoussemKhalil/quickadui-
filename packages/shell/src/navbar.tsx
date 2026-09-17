"use client";

import { cn } from "@quickadui/utils";
import type { ComponentProps } from "react";

/** The top bar of a `DashboardLayout` (or any app shell) — a fixed-height `<header>`, full width, sticky in the sense that it never scrolls with the body since `DashboardLayout` gives it `shrink-0` and puts the scroll on `<main>` instead. */
export function Navbar({ className, ...props }: ComponentProps<"header">) {
  return (
    <header
      data-slot="navbar"
      className={cn(
        "flex h-14 shrink-0 items-center gap-4 border-b border-neutral-6 bg-neutral-1 px-4",
        className,
      )}
      {...props}
    />
  );
}

/** The leading slot — typically a logo/wordmark, and often a `SidebarTrigger` right before it. */
export function NavbarBrand({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="navbar-brand"
      className={cn(
        "flex shrink-0 items-center gap-2 text-sm font-semibold text-neutral-12",
        className,
      )}
      {...props}
    />
  );
}

/** The flexible middle slot — search box, nav links, breadcrumbs, whatever grows to fill the remaining space. */
export function NavbarContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="navbar-content"
      className={cn("flex flex-1 items-center gap-2", className)}
      {...props}
    />
  );
}

/** The trailing slot, pinned to the right — user menu, notifications, theme toggle. */
export function NavbarActions({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="navbar-actions"
      className={cn("ml-auto flex shrink-0 items-center gap-2", className)}
      {...props}
    />
  );
}
