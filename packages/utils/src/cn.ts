import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines `clsx`'s conditional class-name composition with
 * `tailwind-merge`'s Tailwind-aware conflict resolution — the `cn()` used
 * across every styled QuickadUI component (and by consumers overriding
 * className props).
 *
 *   cn("px-2 py-1", isActive && "bg-accent-9", className)
 *
 * `clsx` drops falsy inputs (`false`/`null`/`undefined`) and flattens
 * arrays/objects into one class string first; `twMerge` then resolves
 * genuine Tailwind conflicts (same underlying CSS property) by keeping the
 * *last* one, so a caller-supplied `className` reliably overrides a
 * component's own defaults instead of both classes landing in the output
 * and letting CSS source order decide. Requires `tailwind-merge@^3`, the
 * major aligned with Tailwind CSS v4's utility set (v2 predates v4 and
 * resolves v4-only utilities incorrectly).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
