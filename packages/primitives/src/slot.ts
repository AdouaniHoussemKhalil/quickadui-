"use client";

import { Slot as RadixSlot } from "radix-ui";

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
 */
export const Slot = RadixSlot.Root;

/**
 * For components whose slotted content isn't the direct child — e.g. a
 * `Button` that always renders an icon next to its children — `Slottable`
 * marks which descendant `Slot` should merge props onto. See the Radix
 * Primitives docs for the utilities/slot page.
 */
export const Slottable = RadixSlot.Slottable;

/** Props for a component that supports the `asChild` composition pattern. */
export interface AsChildProps {
  /**
   * Merge this component's props onto its child instead of rendering its
   * own DOM element — see `Slot` above.
   */
  asChild?: boolean;
}
