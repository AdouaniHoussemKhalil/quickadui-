"use client";

import { Switch as SwitchPrimitive } from "radix-ui";
import type { ComponentProps } from "react";

/**
 * A thin adapter over Radix UI's Switch primitive — same reasoning as
 * `checkbox.tsx`: `SwitchRoot` is a real, always-visible `<button
 * role="switch">`, not a state manager, so it gets a `data-slot`, as does
 * `SwitchThumb` (the sliding circle inside it).
 */
export function SwitchRoot(props: ComponentProps<typeof SwitchPrimitive.Root>) {
  return <SwitchPrimitive.Root data-slot="switch" {...props} />;
}

export function SwitchThumb(props: ComponentProps<typeof SwitchPrimitive.Thumb>) {
  return <SwitchPrimitive.Thumb data-slot="switch-thumb" {...props} />;
}
