"use client";

import { Slot as RadixSlot } from "radix-ui";
import type { ComponentProps } from "react";

/**
 * Merges its own props onto its single child instead of rendering its own
 * DOM node — the mechanism behind the `asChild` pattern used across
 * QuickadUI (see `AsChildProps` below). A component built as:
 *
 *   function Button({ asChild, ...props }: AsChildProps<"button">) {
 *     const Comp = asChild ? Slot : "button";
 *     return <Comp {...props} />;
 *   }
 *
 * lets a consumer replace the rendered element (`<Button asChild><a
 * href="/x">...</a></Button>`) while keeping `Button`'s own props/behavior.
 * Re-exported from `radix-ui` rather than hand-rolled: merging props, refs,
 * and `style`/`className` correctly onto an arbitrary child is exactly the
 * kind of DOM-composition edge-case Radix has already solved, and QuickadUI
 * packages never import `radix-ui` directly — only this adapter does.
 *
 * Wrapped in a real function component (not `export const Slot =
 * RadixSlot.Root`) on purpose: `RadixSlot.Root`'s own type isn't fully
 * nameable outside `@radix-ui/react-slot`, which makes a plain value
 * re-export fail declaration-file generation (TS4023, "... but cannot be
 * named"). Wrapping it the same way `separator.tsx`/`avatar.tsx` already do
 * gives `tsc` a type it built itself — a plain function over `ComponentProps<>`
 * — which is always nameable.
 */
export function Slot(props: ComponentProps<typeof RadixSlot.Root>) {
  return <RadixSlot.Root {...props} />;
}

/**
 * For components whose slotted content isn't the direct child — e.g. a
 * `Button` that always renders an icon next to its children — `Slottable`
 * marks which descendant `Slot` should merge props onto. See the Radix
 * Primitives docs for the utilities/slot page. Wrapped for the same reason
 * as `Slot` above.
 */
export function Slottable(props: ComponentProps<typeof RadixSlot.Slottable>) {
  return <RadixSlot.Slottable {...props} />;
}

/** Props for a component that supports the `asChild` composition pattern. */
export interface AsChildProps {
  /**
   * Merge this component's props onto its child instead of rendering its
   * own DOM element — see `Slot` above.
   */
  asChild?: boolean;
}
