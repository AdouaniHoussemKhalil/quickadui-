"use client";

import { MenuIcon } from "@quickadui/icons";
import { cn } from "@quickadui/utils";
import { cva } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { useSidebar } from "./sidebar-context";

export interface SidebarProps extends ComponentProps<"aside"> {
  /** Which edge of the shell this sidebar is docked to. Default: `"left"`. */
  side?: "left" | "right";
}

/**
 * A persistent desktop sidebar — distinct from `@quickadui/overlays`'
 * `Drawer`, which is a temporary slide-over (with a backdrop, dismissible
 * by Escape/outside-click). This one is always in the document flow; its
 * only two states are expanded and collapsed-to-icons, driven by the
 * nearest `<SidebarProvider>` (see `sidebar-context.tsx`) rather than
 * anything owned here.
 */
export function Sidebar({ className, side = "left", ...props }: SidebarProps) {
  const { collapsed } = useSidebar();
  return (
    <aside
      data-slot="sidebar"
      data-collapsed={collapsed}
      data-side={side}
      className={cn(
        "flex h-full shrink-0 flex-col bg-neutral-1 transition-[width] duration-200",
        side === "left" ? "border-r border-neutral-6" : "order-last border-l border-neutral-6",
        collapsed ? "w-16" : "w-64",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn(
        "flex h-14 shrink-0 items-center gap-2 border-b border-neutral-6 px-3",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarContent({ className, ...props }: ComponentProps<"nav">) {
  return (
    <nav
      data-slot="sidebar-content"
      className={cn("flex flex-1 flex-col gap-1 overflow-y-auto p-2", className)}
      {...props}
    />
  );
}

export function SidebarFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn("shrink-0 border-t border-neutral-6 p-2", className)}
      {...props}
    />
  );
}

/** A labeled cluster of `SidebarNavItem`s — the label hides itself while collapsed rather than truncating, since a single-letter label is worse than no label. */
export function SidebarGroup({ className, ...props }: ComponentProps<"div">) {
  return (
    <div data-slot="sidebar-group" className={cn("flex flex-col gap-0.5", className)} {...props} />
  );
}

export function SidebarGroupLabel({ className, ...props }: ComponentProps<"div">) {
  const { collapsed } = useSidebar();
  if (collapsed) {
    return null;
  }
  return (
    <div
      data-slot="sidebar-group-label"
      className={cn(
        "px-3 pb-1 pt-3 text-xs font-medium uppercase tracking-wide text-neutral-9",
        className,
      )}
      {...props}
    />
  );
}

/**
 * `state`, not a `{ true, false }` boolean variant key — same reasoning
 * as `@quickadui/data`'s `tableRowVariants`/`paginationLinkVariants`: the
 * local `class-variance-authority` stub used to validate this monorepo
 * doesn't replicate cva's real boolean-key-to-`boolean`-prop inference,
 * so `SidebarNavItem`'s public `active` prop is a hand-declared `boolean`
 * that converts to this variant internally instead.
 */
export const sidebarNavItemVariants = cva(
  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-neutral-3",
  {
    variants: {
      state: {
        default: "text-neutral-11",
        active: "bg-accent-3 text-accent-11 hover:bg-accent-3",
      },
    },
    defaultVariants: {
      state: "default",
    },
  },
);

export interface SidebarNavItemProps extends ComponentProps<"a"> {
  active?: boolean;
  /** Rendered before the label. Kept visible while collapsed — the label is what hides. */
  icon?: ReactNode;
}

/**
 * Renders an `<a>` — pass `href` for a real link, or omit it and handle
 * `onClick` yourself for a router `Link`-less SPA. There's no `asChild`
 * escape hatch yet (that would need `Slot` from `@quickadui/primitives`,
 * which this package deliberately doesn't depend on — see the README);
 * wrapping your own router's `Link` and forwarding `className`/`children`
 * is the workaround until that lands.
 */
export function SidebarNavItem({
  className,
  active,
  icon,
  children,
  ...props
}: SidebarNavItemProps) {
  const { collapsed } = useSidebar();
  return (
    <a
      data-slot="sidebar-nav-item"
      className={cn(sidebarNavItemVariants({ state: active ? "active" : "default" }), className)}
      {...props}
    >
      {icon}
      {!collapsed && <span className="truncate">{children}</span>}
    </a>
  );
}

/** Toggles the nearest `<SidebarProvider>`'s collapsed state — typically placed in a `Navbar` (see `navbar.tsx`), not inside the `Sidebar` it controls. */
export function SidebarTrigger({ className, onClick, ...props }: ComponentProps<"button">) {
  const { collapsed, toggle } = useSidebar();

  // Annotated `any`, not a narrow structural type — this handler FORWARDS
  // `event` onward to the real `onClick` prop (destructured from
  // `ComponentProps<"button">` above) instead of only consuming it
  // internally. Under the real `@types/react` used by consumers of this
  // package, that destructured `onClick` is genuinely typed
  // `MouseEventHandler<HTMLButtonElement>`, i.e.
  // `(event: MouseEvent<HTMLButtonElement>) => void` — passing a narrower
  // structural type or `unknown` there fails to compile (`unknown` is not
  // assignable to a specific parameter type without a guard). `any` is the
  // only annotation assignable to both that real signature and the local
  // react-stub's permissive `[elemName: string]: any` typing (see
  // `react.d.ts`) that a hardcoded `<button onClick={...}>` resolves
  // through here. Contrast with `@quickadui/data`'s `tree-view.tsx`, where
  // the event is only used internally (`.stopPropagation()`) and never
  // forwarded, so a narrow structural type is safe there. Pulled out to a
  // named `const` (rather than inlined on the JSX attribute) so the
  // suppression directive below reliably attaches to a plain statement.
  // biome-ignore lint/suspicious/noExplicitAny: see comment above — must forward to the real MouseEventHandler<HTMLButtonElement> onClick prop
  const handleClick = (event: any) => {
    onClick?.(event);
    toggle();
  };

  return (
    <button
      type="button"
      data-slot="sidebar-trigger"
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      onClick={handleClick}
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-md text-neutral-11 transition-colors hover:bg-neutral-3",
        className,
      )}
      {...props}
    >
      <MenuIcon size={18} />
    </button>
  );
}
