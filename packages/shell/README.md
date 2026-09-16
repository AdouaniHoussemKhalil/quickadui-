# @quickadui/shell

Application-shell layout components for an admin/dashboard-style app
frame: `Navbar`, a collapsible `Sidebar`, `Footer`, and a
`DashboardLayout` that composes all three around your page content.

> Not to be confused with `@quickadui/layout` — that package is generic
> layout primitives (`Flex`/`Stack`/`Grid`/`Container`/`Section`) meant
> for arranging content anywhere on a page. This package is specifically
> about the outer app frame (nav + sidebar + content + footer), and
> doesn't depend on `@quickadui/layout` — its own components render plain
> `<div>`/`<header>`/`<aside>`/`<footer>` with their own Tailwind classes,
> the same pattern `@quickadui/data` uses.

## Phase 1 (the static shell) and Phase 2 (widgets + drag-and-drop) — both shipped

**Phase 1** is the structural shell: `Navbar`/`Sidebar`/`Footer`/
`DashboardLayout`, with one interactive piece (the sidebar's
expand/collapse) and no drag-and-drop dependency at all.

**Phase 2** adds `Widget`/`WidgetGrid` — a responsive grid of cards that's
drag-and-drop sortable (pointer and keyboard), via `@dnd-kit/core` +
`@dnd-kit/sortable` + `@dnd-kit/utilities`. This is the only part of the
package with a drag-and-drop dependency; `Navbar`/`Sidebar`/`Footer`/
`DashboardLayout` don't use it and never will.

## What's in here

- **`SidebarProvider`** / **`useSidebar`** — the collapsed/expanded state
  and its setter/toggle, provided via context. Controlled
  (`collapsed` + `onCollapsedChange`) or uncontrolled
  (`defaultCollapsed`), same pattern as `@quickadui/data`'s `TreeView`.
  `DashboardLayout` (below) wraps its tree in one of these automatically;
  build your own shell without `DashboardLayout` and you wrap your own
  tree in `SidebarProvider` directly.
- **`Sidebar`** (`side?: "left" | "right"`) / **`SidebarHeader`** /
  **`SidebarContent`** / **`SidebarFooter`** / **`SidebarGroup`** /
  **`SidebarGroupLabel`** (hides itself while collapsed) /
  **`SidebarNavItem`** (`active?: boolean`, `icon?: ReactNode` — renders
  an `<a>`; hides its label text while collapsed, keeps the icon) /
  **`SidebarTrigger`** (a button that toggles the nearest
  `SidebarProvider` — put it in your `Navbar`, not inside the `Sidebar`
  it controls).
- **`Navbar`** / **`NavbarBrand`** (leading slot) / **`NavbarContent`**
  (flexible middle slot) / **`NavbarActions`** (trailing slot, pinned
  right).
- **`Footer`** — usable standalone or as `DashboardLayout`'s `footer`
  slot.
- **`DashboardLayout`** (`navbar?`, `sidebar?`, `footer?` slots, plus
  `children` as the scrollable body, plus
  `defaultSidebarCollapsed?`/`sidebarCollapsed?`/`onSidebarCollapsedChange?`
  passed straight through to its internal `SidebarProvider`) — the whole
  frame in one component. Sets `h-screen` on its own root, so it's meant
  to be the outermost layout element on the page (or close to it).
- **`WidgetGrid`** (`items: string[]`, `onReorder?: (items: string[]) => void`,
  `columns?: 1 | 2 | 3 | 4`, default `3`) — a responsive grid of `Widget`s.
  `items` is the ordered list of widget ids and is the single source of
  truth for order: `WidgetGrid` never reorders anything itself, a
  completed drag just calls `onReorder` with the new array for you to
  store (a plain `useState` is enough — see `apps/playground`'s
  `DashboardDemo.tsx`). Omit `onReorder` for a plain, non-draggable grid
  (no `@dnd-kit` `DndContext` is even mounted in that case). When given,
  dragging works by pointer (grab a widget's handle) and by keyboard (tab
  to a handle, then arrow keys), and a floating `DragOverlay` clone
  follows the widget being dragged.
- **`Widget`** (`id: string`, required; `title?: ReactNode`,
  `actions?: ReactNode`, `disableDrag?: boolean`) — one card: a header
  (drag handle + `title` + `actions`) over a body (`children`). Meant to
  be used as a direct child of `WidgetGrid`, in the same order as its
  `items` array. `disableDrag` hides the handle and disables dragging for
  just that one widget, while it stays part of an otherwise-draggable
  grid.

## Usage

```tsx
import {
  DashboardLayout,
  Footer,
  Navbar,
  NavbarActions,
  NavbarBrand,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarNavItem,
  SidebarTrigger,
} from "@quickadui/shell";
import { HomeIcon, SettingsIcon } from "@quickadui/icons";

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout
      navbar={
        <Navbar>
          <SidebarTrigger />
          <NavbarBrand>Acme</NavbarBrand>
          <NavbarActions>{/* user menu, etc. */}</NavbarActions>
        </Navbar>
      }
      sidebar={
        <Sidebar>
          <SidebarHeader>Acme</SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>General</SidebarGroupLabel>
              <SidebarNavItem href="/" icon={<HomeIcon size={18} />} active>
                Home
              </SidebarNavItem>
              <SidebarNavItem href="/settings" icon={<SettingsIcon size={18} />}>
                Settings
              </SidebarNavItem>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      }
      footer={<Footer>© Acme</Footer>}
    >
      {children}
    </DashboardLayout>
  );
}
```

### Widgets, with drag-and-drop

```tsx
import { Widget, WidgetGrid } from "@quickadui/shell";
import { useState } from "react";

function Dashboard() {
  const [order, setOrder] = useState(["revenue", "signups", "churn"]);

  return (
    <WidgetGrid items={order} onReorder={setOrder} columns={3}>
      <Widget id="revenue" title="Revenue (MTD)">
        $18,204
      </Widget>
      <Widget id="signups" title="New signups">
        142
      </Widget>
      <Widget id="churn" title="Churn" disableDrag>
        1.2%
      </Widget>
    </WidgetGrid>
  );
}
```

## No `asChild` yet

`SidebarNavItem` renders a plain `<a>` — there's no `asChild`/`Slot`
escape hatch for handing rendering to a router's own `Link` component
yet (that would need `Slot` from `@quickadui/primitives`, which this
package deliberately doesn't depend on, to keep the same
no-Radix-dependency shape as `@quickadui/layout`/`@quickadui/data`). For
now, wrap your router's `Link` yourself and forward `className`, `href`,
and `children`. This is a likely near-term addition, not a permanent
limitation.

## Important: this package needs its own `@source` if you consume it

Like `@quickadui/core`/`@quickadui/layout`/`@quickadui/overlays`/
`@quickadui/forms`/`@quickadui/data`, this package's classes live only in
its own compiled output, invisible to Tailwind's automatic content
detection once pnpm symlinks it into `node_modules` (which is
`.gitignore`d). Add `@source "<path-to>/packages/shell/src"` (monorepo)
or `@source "<path-to>/node_modules/@quickadui/shell"` to your CSS entry
file — see `apps/playground/README.md` for the full explanation.
