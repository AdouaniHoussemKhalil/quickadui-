# @quickadui/overlays

Modal, Drawer, Context Menu, and Toast — the "heavier" overlay patterns.
Modal/Drawer/ContextMenu are all styled wrappers over
`@quickadui/primitives` (Dialog for the first two, ContextMenu for the
third); Toast is different — see its own section below.

> Tooltip/Popover/Dropdown, originally scoped to this package too, ship
> in `@quickadui/core` instead — see its README. `Notification`, the
> last item in this package's original scope, is treated as covered by
> `Toast` (a transient, auto-dismissing message) rather than built as a
> second, barely-distinguishable component — a persistent
> notification-center UI (a bell icon with a list you review later) is a
> genuinely different thing and isn't built here.

## What's in here

- **`Modal`**, **`ModalTrigger`**, **`ModalContent`** (bakes in the
  portal, the overlay, and a close button using `@quickadui/icons`'
  `CloseIcon`), **`ModalHeader`**, **`ModalFooter`**, **`ModalTitle`**,
  **`ModalDescription`**, **`ModalClose`**, **`ModalOverlay`** — a
  centered dialog with a backdrop.
- **`Drawer`** and the same set of parts (`DrawerTrigger`,
  `DrawerContent`, `DrawerHeader`, `DrawerFooter`, `DrawerTitle`,
  `DrawerDescription`, `DrawerClose`, `DrawerOverlay`) — `DrawerContent`
  additionally takes `side` (`top` / `bottom` / `left` / `right`,
  default `right`) via `drawerContentVariants`, sliding in from that
  screen edge instead of appearing centered.
- **`ContextMenu`** and its parts (`ContextMenuTrigger`,
  `ContextMenuContent`, `ContextMenuItem`, `ContextMenuCheckboxItem`,
  `ContextMenuRadioGroup`/`ContextMenuRadioItem`, `ContextMenuLabel`,
  `ContextMenuSeparator`, `ContextMenuSub`/`ContextMenuSubTrigger`/
  `ContextMenuSubContent`, `ContextMenuShortcut`) — the exact same visual
  language as `@quickadui/core`'s `DropdownMenu` (same class strings,
  deliberately, so a menu looks like a menu regardless of how it opened).
  `ContextMenuTrigger` wraps whatever the consumer wants right-clickable;
  it doesn't render any chrome of its own.
- **`toast()`**, **`dismissToast()`**, **`useToast()`**, **`Toaster`** —
  see "Toast" below; this one isn't a set of JSX parts you compose like
  the others.

## Toast: not a component you render per-message

Radix's `Toast` primitive (wrapped, unstyled, in `@quickadui/primitives`)
renders exactly one toast — tracking *which* toasts are currently
showing is deliberately left to you, which is why every Radix-Toast-based
library (sonner, shadcn/ui's toast, ...) ends up with the same shape:
a small store plus a `toast()` function.

- **`toast(options)`** (in `toast-store.ts`) — call this from anywhere
  (a click handler, a form submit, ...) to show a toast. Returns an id
  you can pass to `dismissToast(id)` to remove it early.
- **`Toaster`** — mount this once, high in the tree, same requirement as
  `TooltipProvider`. It reads the current toast list via `useToast()`
  and renders each one, plus the `ToastProvider`/`ToastViewport` Radix
  requires underneath. You never render an individual toast yourself.
- **`useToast()`** — the reactive toast list, exported in case a
  consumer wants a custom toast list UI on top of the same store instead
  of `Toaster`'s.

```tsx
import { Toaster, toast } from "@quickadui/overlays";
import { Button } from "@quickadui/core";

function App() {
  return (
    <>
      <Button onClick={() => toast({ title: "Saved", description: "Your changes were saved.", variant: "success" })}>
        Save
      </Button>
      <Toaster />
    </>
  );
}
```

## A known gap: no enter/exit animation

Nothing in this package animates in or out yet — `Modal`/`Drawer`'s
overlay and content, `ContextMenu`'s content, and each `Toast` all just
appear/disappear instantly. Real animation needs
either Tailwind keyframes defined in `@quickadui/theme`'s generated CSS
or `@quickadui/animation` (still a scaffold, see its own README), and
reaching for classes like `animate-in`/`fade-in-0` that assume a
`tailwindcss-animate`-style plugin this project doesn't have installed
would be exactly the silent-no-styling mistake documented in
`apps/playground/README.md`'s `@source` section — the class renders as
nothing, with no error anywhere to catch it.

## Usage

```tsx
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from "@quickadui/overlays";
import { Button } from "@quickadui/core";

function Example() {
  return (
    <Modal>
      <ModalTrigger asChild>
        <Button>Open</Button>
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Are you sure?</ModalTitle>
          <ModalDescription>This action cannot be undone.</ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <Button variant="outline">Cancel</Button>
          <Button variant="destructive">Delete</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
```

```tsx
import { Drawer, DrawerTrigger, DrawerContent, DrawerTitle } from "@quickadui/overlays";

<Drawer>
  <DrawerTrigger>Open</DrawerTrigger>
  <DrawerContent side="left">
    <DrawerTitle>Navigation</DrawerTitle>
  </DrawerContent>
</Drawer>;
```

```tsx
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator } from "@quickadui/overlays";

<ContextMenu>
  <ContextMenuTrigger className="flex h-32 items-center justify-center rounded-md border border-dashed border-neutral-6">
    Right-click here
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>Copy</ContextMenuItem>
    <ContextMenuItem>Paste</ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem>Delete</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>;
```

## Important: this package needs its own `@source` if you consume it

Like `@quickadui/core` and `@quickadui/layout`, this package's classes
(`fixed`, `bg-neutral-1`, `w-3/4`, ...) live only in its own compiled
output, which Tailwind's automatic content detection never sees once
pnpm symlinks it into `node_modules` (that folder is `.gitignore`d).
Any app consuming this package needs
`@source "<path-to>/node_modules/@quickadui/overlays"` or, for a
monorepo consumer, `@source "<path-to>/packages/overlays/src"` in its
CSS entry file — see `apps/playground/README.md` for the full
explanation and `apps/playground/src/index.css` for a working example
with `core`/`primitives`/`layout`.
