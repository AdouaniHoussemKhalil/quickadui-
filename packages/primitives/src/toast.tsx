"use client";

import { Toast as ToastPrimitive } from "radix-ui";
import type { ComponentProps } from "react";

/**
 * A thin adapter over Radix UI's Toast primitive — see `dialog.tsx` for
 * why this package re-exports rather than lets consumers import
 * `radix-ui` directly, and `slot.tsx` for why every part below is a real
 * function component over `ComponentProps<typeof X>` rather than a raw
 * value re-export.
 *
 * Unlike every other overlay primitive in this package, Radix's Toast
 * doesn't manage its own open/closed list — `Toast` (the `Root`) is
 * meant to be rendered once per active toast, by whatever code tracks
 * "what toasts are currently showing." `@quickadui/overlays`' `Toaster`
 * is that code, with a small module-level store (`toast-store.ts`) and a
 * `toast()` function — see that package's README.
 *
 * `ToastProvider` must wrap the toast list exactly once, high in the
 * tree (same requirement as `TooltipProvider` in `tooltip.tsx`).
 * `Toast` gets a `data-slot` (it's QuickadUI's own visible chrome once
 * open, not a generic behavioral wrapper); `Viewport` does too, since
 * it's the fixed-position container every toast actually renders into.
 */
export function ToastProvider(props: ComponentProps<typeof ToastPrimitive.Provider>) {
  return <ToastPrimitive.Provider {...props} />;
}

export function Toast(props: ComponentProps<typeof ToastPrimitive.Root>) {
  return <ToastPrimitive.Root data-slot="toast" {...props} />;
}

export function ToastTitle(props: ComponentProps<typeof ToastPrimitive.Title>) {
  return <ToastPrimitive.Title data-slot="toast-title" {...props} />;
}

export function ToastDescription(props: ComponentProps<typeof ToastPrimitive.Description>) {
  return <ToastPrimitive.Description data-slot="toast-description" {...props} />;
}

/** Requires `altText` — the accessible label announced when the toast's visible content can't be (e.g. a screen reader not currently focused on it). */
export function ToastAction(props: ComponentProps<typeof ToastPrimitive.Action>) {
  return <ToastPrimitive.Action data-slot="toast-action" {...props} />;
}

export function ToastClose(props: ComponentProps<typeof ToastPrimitive.Close>) {
  return <ToastPrimitive.Close data-slot="toast-close" {...props} />;
}

export function ToastViewport(props: ComponentProps<typeof ToastPrimitive.Viewport>) {
  return <ToastPrimitive.Viewport data-slot="toast-viewport" {...props} />;
}
