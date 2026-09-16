"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

/** Reads the nearest `<SidebarProvider>`'s collapsed state — throws if used outside one, same pattern as `@quickadui/data`'s `useTreeViewContext`. */
export function useSidebar(): SidebarContextValue {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a <SidebarProvider>");
  }
  return context;
}

export interface SidebarProviderProps {
  children?: ReactNode;
  /** Uncontrolled starting state — ignored once `collapsed` is passed (controlled mode). Default: `false`. */
  defaultCollapsed?: boolean | undefined;
  /** Controlled collapsed state. Pass together with `onCollapsedChange` to drive it from outside (e.g. persisting it yourself). */
  collapsed?: boolean | undefined;
  onCollapsedChange?: ((collapsed: boolean) => void) | undefined;
}

/**
 * Provides `collapsed`/`setCollapsed`/`toggle` to every `Sidebar`,
 * `SidebarTrigger`, `SidebarNavItem`, etc. in its subtree. Renders no DOM
 * of its own — just context — so it never interferes with
 * `DashboardLayout`'s flex structure when that component wraps its own
 * tree in one internally (see `dashboard-layout.tsx`); a consumer
 * building a custom shell without `DashboardLayout` wraps their own tree
 * in this directly.
 *
 * Controlled/uncontrolled resolution follows the same pattern as
 * `@quickadui/data`'s `TreeView` (`expandedIds` vs `defaultExpandedIds`).
 */
export function SidebarProvider({ children, defaultCollapsed = false, collapsed: collapsedProp, onCollapsedChange }: SidebarProviderProps) {
  const [uncontrolledCollapsed, setUncontrolledCollapsed] = useState(defaultCollapsed);
  const isControlled = collapsedProp !== undefined;
  const collapsed = isControlled ? collapsedProp : uncontrolledCollapsed;

  const setCollapsed = (next: boolean) => {
    if (!isControlled) {
      setUncontrolledCollapsed(next);
    }
    onCollapsedChange?.(next);
  };

  const toggle = () => setCollapsed(!collapsed);

  return <SidebarContext.Provider value={{ collapsed, setCollapsed, toggle }}>{children}</SidebarContext.Provider>;
}
