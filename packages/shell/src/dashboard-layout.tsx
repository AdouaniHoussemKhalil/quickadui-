"use client";

import { cn } from "@quickadui/utils";
import type { ComponentProps, ReactNode } from "react";
import { SidebarProvider } from "./sidebar-context";

export interface DashboardLayoutProps extends ComponentProps<"div"> {
  /** Typically a `<Navbar>` (see `navbar.tsx`) — rendered full-width, above everything else. */
  navbar?: ReactNode | undefined;
  /** Typically a `<Sidebar>` (see `sidebar.tsx`) — rendered to the left (or right, per its own `side` prop) of the scrollable body. */
  sidebar?: ReactNode | undefined;
  /** Typically a `<Footer>` (see `footer.tsx`) — rendered under the scrollable body, inside the content column. */
  footer?: ReactNode | undefined;
  /** Passed straight through to the `SidebarProvider` this component wraps its tree in — see `sidebar-context.tsx`. */
  defaultSidebarCollapsed?: boolean | undefined;
  sidebarCollapsed?: boolean | undefined;
  onSidebarCollapsedChange?: ((collapsed: boolean) => void) | undefined;
}

/**
 * The full admin/dashboard app frame: a `navbar` slot spanning the full
 * width, a `sidebar` slot and a scrollable content column side by side
 * below it, with `children` as the scrollable body and an optional
 * `footer` slot under it (inside the content column, not spanning the
 * sidebar).
 *
 * Wraps its whole tree in a `SidebarProvider` (see `sidebar-context.tsx`)
 * automatically — a `sidebar` built from `Sidebar`/`SidebarTrigger`/etc.
 * just works without the caller setting that up separately. A consumer
 * building a fully custom shell without this component wraps their own
 * tree in `SidebarProvider` directly instead.
 *
 * Sets `h-screen` on its own root, so it's meant to be the outermost
 * layout element on the page (or close to it) — nesting it inside
 * something shorter than the viewport will clip it.
 */
export function DashboardLayout({
  className,
  navbar,
  sidebar,
  footer,
  defaultSidebarCollapsed,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  children,
  ...props
}: DashboardLayoutProps) {
  return (
    <SidebarProvider defaultCollapsed={defaultSidebarCollapsed} collapsed={sidebarCollapsed} onCollapsedChange={onSidebarCollapsedChange}>
      <div data-slot="dashboard-layout" className={cn("flex h-screen flex-col overflow-hidden", className)} {...props}>
        {navbar}
        <div className="flex flex-1 overflow-hidden">
          {sidebar}
          <div className="flex flex-1 flex-col overflow-hidden">
            <main data-slot="dashboard-layout-body" className="flex-1 overflow-y-auto p-4">
              {children}
            </main>
            {footer}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
