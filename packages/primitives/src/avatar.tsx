"use client";

import { Avatar as AvatarPrimitive } from "radix-ui";
import type { ComponentProps } from "react";

/**
 * A thin adapter over Radix UI's Avatar primitive — see `dialog.tsx` for
 * why this package re-exports rather than lets consumers import `radix-ui`
 * directly. Unlike Dialog, all three parts render real, always-styled DOM
 * nodes (there's no purely-behavioral Trigger/Portal here), so all three
 * get a `data-slot`.
 */
export function AvatarRoot(props: ComponentProps<typeof AvatarPrimitive.Root>) {
  return <AvatarPrimitive.Root data-slot="avatar" {...props} />;
}

export function AvatarImage(props: ComponentProps<typeof AvatarPrimitive.Image>) {
  return <AvatarPrimitive.Image data-slot="avatar-image" {...props} />;
}

export function AvatarFallback(props: ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return <AvatarPrimitive.Fallback data-slot="avatar-fallback" {...props} />;
}
