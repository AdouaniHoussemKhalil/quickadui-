"use client";

import { Separator as SeparatorPrimitive } from "radix-ui";
import type { ComponentProps } from "react";

/**
 * A thin adapter over Radix UI's Separator primitive — see `dialog.tsx` for
 * why this package re-exports rather than lets consumers import `radix-ui`
 * directly. Adds a stable `data-slot="separator"` hook for styling that
 * survives whatever actually implements this underneath. Deliberately
 * doesn't redeclare Radix's own prop defaults (e.g. `orientation`) here —
 * duplicating them would silently go stale if Radix ever changes them.
 */
export function Separator(props: ComponentProps<typeof SeparatorPrimitive.Root>) {
  return <SeparatorPrimitive.Root data-slot="separator" {...props} />;
}
