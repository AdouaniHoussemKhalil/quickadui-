# @quickadui/icons

Wrapped [Lucide](https://lucide.dev) icons behind one stable QuickadUI
contract. **The only QuickadUI package that imports `lucide-react`
directly** — same reasoning as `@quickadui/primitives` never letting
consumers import `radix-ui` directly (see that package's README): if
QuickadUI ever swaps icon vendors, only this package's internals change.

## What's in here

- **`IconProps`** — the one prop contract every icon here follows
  (`size`, `color`, `strokeWidth`, plus every other native `<svg>`
  attribute), re-exported straight from Lucide's own `LucideProps` type.
- **26 icons**, each a real function component over `IconProps` rather
  than a raw `export const X = LucideX` — see `slot.tsx` in
  `@quickadui/primitives` for why every non-pass-through part in this
  monorepo follows that pattern. (Lucide's own `LucideIcon`/`LucideProps`
  types are publicly nameable, so a raw re-export wouldn't actually hit
  the TS4023 bug that pattern exists to avoid here — the wrapper is
  about consistency, not necessity.)

| QuickadUI name | Lucide icon |
| --- | --- |
| `ChevronDownIcon` / `ChevronUpIcon` / `ChevronLeftIcon` / `ChevronRightIcon` | `chevron-down` / `chevron-up` / `chevron-left` / `chevron-right` |
| `CheckIcon` | `check` |
| `CloseIcon` | `x` |
| `CircleIcon` | `circle` |
| `MinusIcon` | `minus` |
| `SearchIcon` | `search` |
| `MenuIcon` | `menu` |
| `MoreHorizontalIcon` / `MoreVerticalIcon` | `more-horizontal` / `more-vertical` |
| `InfoIcon` | `info` |
| `WarningIcon` | `triangle-alert` |
| `ErrorIcon` | `circle-alert` |
| `SuccessIcon` | `circle-check` |
| `CancelIcon` | `circle-x` |
| `EyeIcon` / `EyeOffIcon` | `eye` / `eye-off` |
| `CalendarIcon` | `calendar` |
| `ClockIcon` | `clock` |
| `UserIcon` | `user` |
| `SettingsIcon` | `settings` |
| `TrashIcon` | `trash-2` |
| `PlusIcon` | `plus` |
| `LoaderIcon` | `loader-circle` |

`WarningIcon`/`ErrorIcon`/`CancelIcon` are three deliberately distinct
silhouettes for three different situations, not synonyms: a triangle for
"be careful" (`Alert`'s `warning` variant), a circled exclamation for "this
failed validation" (inline field errors), a circled X for "dismissed" or
"this action failed" (toasts). Picking the wrong one for the situation
is an easy mistake precisely because they're visually similar — check the
Lucide preview for each before swapping one in.

This list isn't meant to cover Lucide's full ~1,600-icon set — it's the
icons QuickadUI's own components need plus a handful of generically
useful ones. It grows incrementally; if a component elsewhere in the
monorepo needs a new one, add it here rather than importing `lucide-react`
directly in that package.

## A known gap

The description promises "QuickadUI-original glyphs" alongside the
Lucide wrapping — none exist yet. `@quickadui/core`'s `Spinner` and its
internal `_internal-icons.tsx` (used by `AccordionTrigger`/
`DropdownMenu`) still draw their own inline SVGs rather than depending on
this package, both predating it. Migrating them here, plus adding an
actual QuickadUI brand glyph, is future work, not done in this pass — a
deliberate choice to avoid touching `core`'s already-working, already
build-validated files in the same pass as bringing in a whole new
external dependency (`lucide-react`) for the first time.

## Usage

```tsx
import { SearchIcon } from "@quickadui/icons";

<SearchIcon size={16} className="text-neutral-11" />;
```
