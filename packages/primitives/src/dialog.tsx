"use client";

import { Dialog as DialogPrimitive } from "radix-ui";
import type { ComponentProps } from "react";

/**
 * A thin adapter over Radix UI's Dialog primitive (Blueprint §1/§4: this
 * package is the *only* place that imports `radix-ui` — everything above it
 * imports from here instead). Each part is re-exported under QuickadUI's
 * own name with a stable `data-slot` attribute, so styling and future
 * headless-primitives-vendor swaps (e.g. to Base UI) never touch anything
 * above this file. This layer stays unstyled and uncomposed on purpose —
 * default styling and part composition (e.g. always rendering an Overlay
 * behind Content) is the `@quickadui/overlays` package's job, not this
 * one's.
 */
// Wrapped in real function components (not `export const Dialog =
// DialogPrimitive.Root`) on purpose: Radix's own component types aren't all
// fully nameable outside their own package, which can make a plain value
// re-export fail declaration-file generation (TS4023, "... but cannot be
// named") — see slot.tsx for the same fix applied to Slot/Slottable, where
// it was confirmed to actually happen. Root/Trigger/Portal manage state and
// portaling rather than rendering their own styled DOM node, so — like
// DialogPrimitive.Root et al. below — no `data-slot` here.
export function Dialog(props: ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root {...props} />;
}

export function DialogTrigger(props: ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger {...props} />;
}

export function DialogPortal(props: ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal {...props} />;
}

export function DialogOverlay(props: ComponentProps<typeof DialogPrimitive.Overlay>) {
  return <DialogPrimitive.Overlay data-slot="dialog-overlay" {...props} />;
}

export function DialogContent(props: ComponentProps<typeof DialogPrimitive.Content>) {
  return <DialogPrimitive.Content data-slot="dialog-content" {...props} />;
}

export function DialogTitle(props: ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title data-slot="dialog-title" {...props} />;
}

export function DialogDescription(props: ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description data-slot="dialog-description" {...props} />;
}

export function DialogClose(props: ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}
