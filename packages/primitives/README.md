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
- **`Popover` / `PopoverTrigger` / `PopoverAnchor` / `PopoverPortal` /
  `PopoverContent` / `PopoverClose` / `PopoverArrow`** — same
  Trigger-gets-no-slot reasoning as Dialog.
- **`Tooltip` / `TooltipProvider` / `TooltipTrigger` / `TooltipPortal` /
  `TooltipContent` / `TooltipArrow`** — `TooltipProvider` is required
  exactly once, high in the tree, for the "skip the opening delay on a
  second tooltip" behavior to work across an app's tooltips.
- **`Tabs` / `TabsList` / `TabsTrigger` / `TabsContent`** — unlike an
  overlay's Trigger, `TabsTrigger` *is* QuickadUI's own visible tab button,
  not a generic opener a consumer composes their own `Button` into — so
  every part here gets a `data-slot`, `Root` included.
- **`Accordion` / `AccordionItem` / `AccordionHeader` / `AccordionTrigger` /
  `AccordionContent`** — same "every part is QuickadUI's own visible
  chrome" reasoning as Tabs. `AccordionHeader` exists only because Radix
  requires it to wrap `AccordionTrigger` in the correct heading semantics.
- **`DropdownMenu` / `DropdownMenuTrigger` / `DropdownMenuPortal` /
  `DropdownMenuContent` / `DropdownMenuArrow` / `DropdownMenuItem` /
  `DropdownMenuGroup` / `DropdownMenuLabel` / `DropdownMenuCheckboxItem` /
  `DropdownMenuItemIndicator` / `DropdownMenuRadioGroup` /
  `DropdownMenuRadioItem` / `DropdownMenuSeparator` / `DropdownMenuSub` /
  `DropdownMenuSubTrigger` / `DropdownMenuSubContent`** — `SubTrigger`
  differs from the top-level `Trigger`: it opens a submenu rather than the
  whole menu, and is itself a menu item, styled like `Item` — so, unlike
  `Trigger`, it gets a `data-slot`.
- **`ContextMenu` / `ContextMenuTrigger` / `ContextMenuPortal` /
  `ContextMenuContent` / `ContextMenuItem` / `ContextMenuGroup` /
  `ContextMenuLabel` / `ContextMenuCheckboxItem` /
  `ContextMenuItemIndicator` / `ContextMenuRadioGroup` /
  `ContextMenuRadioItem` / `ContextMenuSeparator` / `ContextMenuSub` /
  `ContextMenuSubTrigger` / `ContextMenuSubContent`** — same part shape
  and `data-slot` reasoning as `DropdownMenu`; Radix's ContextMenu and
  DropdownMenu APIs are near-identical, differing mainly in how they
  open (right-click vs. click/keyboard).
- **`ToastProvider` / `Toast` / `ToastTitle` / `ToastDescription` /
  `ToastAction` / `ToastClose` / `ToastViewport`** — unlike every other
  overlay primitive here, Radix's `Toast` doesn't manage its own list of
  open/closed instances: `Toast` (`Root`) is meant to be rendered once
  per active toast by whatever code tracks "what's currently showing."
  `@quickadui/overlays`' `Toaster` + `toast()` is that code — see its
  README. `ToastProvider` is required exactly once, high in the tree,
  same requirement as `TooltipProvider`.
- **`CheckboxRoot` / `CheckboxIndicator`**, **`SwitchRoot` /
  `SwitchThumb`**, **`RadioGroupRoot` / `RadioGroupItem` /
  `RadioGroupIndicator`**, **`Label`** — the form-control primitives
  `@quickadui/forms` styles. `Root`/`Item` here are real, always-visible
  DOM (a `<button role="checkbox">`, `role="switch"`, `role="radio">`) —
  unlike `Dialog`'s `Root`, which renders nothing — so, like
  `Tabs`/`TabsTrigger`, they get a `data-slot`. `Label` is a single-part
  primitive (no `Root` suffix needed), same as `Separator`.
- **`Select` / `SelectTrigger` / `SelectValue` / `SelectIcon` /
  `SelectPortal` / `SelectContent` / `SelectViewport` / `SelectItem` /
  `SelectItemText` / `SelectItemIndicator` / `SelectScrollUpButton` /
  `SelectScrollDownButton` / `SelectGroup` / `SelectLabel` /
  `SelectSeparator` / `SelectArrow`** — the biggest single part set after
  DropdownMenu/ContextMenu. `Select`/`SelectPortal` render no DOM of
  their own (state management and portaling only, same reasoning as
  `Dialog`), so they get no slot; `SelectTrigger` is different from
  `DropdownMenuTrigger` — it isn't a generic thing a consumer composes
  their own `Button` into via `asChild`, it *is* QuickadUI's own default
  select button — so it, and every other part below it, gets one.

Every part above that isn't a raw pass-through wraps its Radix component in
a real function component over `ComponentProps<typeof X>`
(`export function Y(props: ...) { return <X {...props} />; }`) rather than
`export const Y = X` — the latter fails `tsc --emitDeclarationOnly` with
TS4023 ("... but cannot be named") whenever the Radix-internal type behind
`X` isn't itself exported/nameable outside its own package. `slot.tsx` was
the first place this actually broke a real build; every primitive added
since follows the safe pattern from the start.

More primitives land here incrementally, following the same pattern, as
the packages that need them are built.

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
