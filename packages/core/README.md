# @quickadui/core

The first styled components — built on `@quickadui/primitives` (behavior),
`@quickadui/theme`'s semantic color tokens (`accent`/`neutral`/`success`/
`warning`/`danger`, each with the Blueprint's 12-step scale), and
`@quickadui/utils`'s `cn()`.

## What's in here

- **`Button`** / **`IconButton`** — `variant` (`solid` / `soft` / `outline` / `ghost` / `destructive` on Button, no `destructive` on IconButton) × `size` (`sm`/`md`/`lg`). Both support `asChild` (via `@quickadui/primitives`' `Slot`). `IconButton` makes `aria-label` a *required* prop — an icon-only button has no visible text, so there's nothing for a screen reader to announce without one.
- **`Badge`** — `variant`: `solid` / `soft` / `outline` / `success` / `warning` / `danger`.
- **`Card`**, **`CardHeader`**, **`CardTitle`**, **`CardDescription`**, **`CardContent`**, **`CardFooter`** — structural only, no variants. A visually distinct card is a `className` override, not a new enum value to maintain forever.
- **`Alert`**, **`AlertTitle`**, **`AlertDescription`** — `variant`: `default` / `success` / `warning` / `danger`. Reserves space for a leading icon automatically (`[&:has(svg)]:pl-11`) — just render an `<svg>` as Alert's first child.
- **`Avatar`**, **`AvatarImage`**, **`AvatarFallback`** — wraps `@quickadui/primitives`' Avatar adapter (which wraps Radix's, for its image-load/fallback-timing behavior). `size`: `sm`/`md`/`lg`.
- **`Spinner`** — `size`: `sm`/`md`/`lg`. Accessible by construction: the SVG is `aria-hidden`, a `role="status"` wrapper plus a visually-hidden (`sr-only`) `label` (default `"Loading"`) is what's actually announced.
- **`Skeleton`** — a single `animate-pulse` placeholder block; size it with `className`.
- **`Typography`** — `variant`: `h1`–`h4` / `body` / `lead` / `small` / `muted`, each with a semantically-appropriate default tag (`h1`→`<h1>`, `body`→`<p>`, ...). Override the tag independently with `as` (e.g. `variant="h1" as="div"` for something that looks like a heading without claiming to be one in the outline), or compose via `asChild`.
- **`Tooltip`**, **`TooltipTrigger`**, **`TooltipContent`** (+ **`TooltipProvider`**, required once high in the tree) — wraps `@quickadui/primitives`' Tooltip. `TooltipContent` bakes in the portal and the arrow; only `TooltipContent` carries QuickadUI styling, the rest are behavioral pass-throughs.
- **`Popover`**, **`PopoverTrigger`**, **`PopoverAnchor`**, **`PopoverClose`**, **`PopoverContent`** — same shape as Tooltip: `PopoverContent` bakes in the portal and arrow and carries the styling, the rest pass through.
- **`Tabs`**, **`TabsList`**, **`TabsTrigger`**, **`TabsContent`** — unlike Tooltip/Popover, every part here is QuickadUI's own visible chrome (not a generic opener), so every part carries styling. `TabsTrigger` uses `data-[state=active]` to style the selected tab.
- **`Accordion`**, **`AccordionItem`**, **`AccordionTrigger`**, **`AccordionContent`** — same every-part-is-visible-chrome reasoning as Tabs. `AccordionTrigger` bakes in the `AccordionHeader` wrapping Radix requires and renders a chevron that rotates via `data-[state=open]`.
- **`DropdownMenu`**, **`DropdownMenuTrigger`**, **`DropdownMenuContent`**, **`DropdownMenuItem`**, **`DropdownMenuGroup`**, **`DropdownMenuLabel`**, **`DropdownMenuSeparator`**, **`DropdownMenuCheckboxItem`**, **`DropdownMenuRadioGroup`**, **`DropdownMenuRadioItem`**, **`DropdownMenuSub`**, **`DropdownMenuSubTrigger`**, **`DropdownMenuSubContent`**, **`DropdownMenuShortcut`** — `DropdownMenuContent`/`DropdownMenuSubContent` bake in the portal. `DropdownMenuShortcut` is cosmetic only (a plain `<span>`, not a Radix part) for a right-aligned hint like a keyboard shortcut inside an `Item`.

These five overlay/composite components are a deliberate exception to the
last bullet below: their pass-through parts (`Tooltip`, `Popover`,
`DropdownMenuTrigger`, ...) don't set their own `data-slot` — the
`@quickadui/primitives` layer underneath already does, and re-setting it
here would just duplicate the attribute for no benefit.

## A known simplification

Solid-variant components (`Button`'s `solid`/`destructive`, `Badge`'s
`solid`) use `text-white` against the step-9 solid fill. That's correct for
this palette's specific seed colors (mid-to-dark accent/danger), but a
brand color light enough to fail contrast against white wouldn't be caught
here. The real fix is a computed per-scale contrast token in
`@quickadui/tokens` (WCAG-luminance-driven, picking white or near-black per
scale) — not built yet.

## Every component

- forwards `className` through `cn()` so a caller's override always wins over the component's own defaults (Tailwind-conflict-aware, not just concatenated);
- sets a stable `data-slot="..."` attribute matching its name, for styling hooks that survive internal refactors;
- forwards every other native prop it doesn't otherwise use.
