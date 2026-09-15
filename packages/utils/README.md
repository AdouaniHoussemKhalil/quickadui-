# @quickadui/utils

`cn()`, and shared type helpers used across every other package. Framework-agnostic — no React dependency, so it's safe to import from the CLI or any non-React consumer too.

## What's in here

- **`cn(...inputs)`** — `clsx` (conditional class composition) + `tailwind-merge` (Tailwind-aware conflict resolution), the standard `cn()` every styled QuickadUI component uses to merge its own default classes with a caller-supplied `className`:

  ```ts
  import { cn } from "@quickadui/utils";

  function Button({ className, ...props }: ButtonProps) {
    return <button className={cn("px-3 py-2 rounded-md bg-accent-9", className)} {...props} />;
  }
  ```

  Requires `tailwind-merge@^3`, the major aligned with Tailwind CSS v4's utility set — see the [v2→v3 migration notes](https://github.com/dcastil/tailwind-merge/blob/main/docs/changelog/v2-to-v3-migration.md); `twMerge()`'s own call signature didn't change, only the classes it understands.

- **`Prettify<T>`** — flattens an intersection type (`A & B`) into one object type for cleaner editor tooltips. Zero runtime cost, zero effect on what's assignable — purely a DX aid for component prop types that get built up from several extended interfaces (e.g. `AsChildProps & ComponentProps<"button">`).

Deliberately narrow scope for now: formatters and further shared helpers land here as concrete packages actually need them, rather than speculatively.
