# @quickadui/primitives

Unstyled behavior primitives. **The only QuickadUI package that imports
`radix-ui` directly** — see the Blueprint, §1 and §4. Every part is
re-exported under a QuickadUI name with a stable `data-slot` attribute, so:

- upstream packages (`core`, `overlays`, `forms`, ...) only ever depend on
  `@quickadui/primitives`, never on `radix-ui`;
- styling can target `[data-slot="dialog-content"]` etc. regardless of what
  actually implements the behavior underneath;
- if QuickadUI ever swaps headless-primitives vendor (e.g. to Base UI), only
  this package's internals change.

This layer stays deliberately unstyled and uncomposed — it does not decide
that a `Dialog` should always render an `Overlay` behind its `Content`, for
instance. Default styling and part composition is `@quickadui/overlays`'
job (and friends), built on top of these.

## What's in here

- **`composeRefs`** — merges multiple refs (callback or object) targeting
  the same node into one, including React 19 ref-cleanup-function support.
  Framework-agnostic, no React import.
- **`Slot` / `Slottable`** — the `asChild` composition mechanism. See the
  Radix Primitives docs, "Slot", for the underlying behavior; `AsChildProps`
  is the prop-type half for authoring your own `asChild`-supporting
  components.
- **`Separator`** — single-part primitive, re-exported as-is plus
  `data-slot="separator"`.
- **`Dialog` / `DialogTrigger` / `DialogPortal` / `DialogOverlay` /
  `DialogContent` / `DialogTitle` / `DialogDescription` / `DialogClose`** —
  the Dialog primitive's parts, each with its matching `data-slot`.
- **`AvatarRoot` / `AvatarImage` / `AvatarFallback`** — the Avatar
  primitive's parts (all three render real, always-styled DOM nodes, so all
  three get a `data-slot`, unlike Dialog's mostly-behavioral Root/Trigger).

More primitives (Popover, DropdownMenu, Tabs, Tooltip, ...) land here
incrementally, following the same pattern, as the packages that need them
are built.

## Usage

```tsx
import { Dialog, DialogContent, DialogPortal, DialogOverlay, DialogTrigger, DialogTitle } from "@quickadui/primitives";

function Example() {
  return (
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
```

```tsx
import { Slot, type AsChildProps } from "@quickadui/primitives";

interface ButtonProps extends AsChildProps, React.ComponentProps<"button"> {}

function Button({ asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp {...props} />;
}
```
