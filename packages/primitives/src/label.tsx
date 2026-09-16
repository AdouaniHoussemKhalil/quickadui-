"use client";

import { Label as LabelPrimitive } from "radix-ui";
import type { ComponentProps } from "react";

/**
 * A thin adapter over Radix UI's Label primitive. Only one part exists
 * (`Root`), so — unlike `Avatar` (`AvatarRoot`/`AvatarImage`/
 * `AvatarFallback`, which need the `Root` suffix to disambiguate) — it
 * keeps the bare name `Label`, same as `Separator`. It's real, always-
 * visible DOM (a `<label>`), so it gets a `data-slot`.
 */
export function Label(props: ComponentProps<typeof LabelPrimitive.Root>) {
  return <LabelPrimitive.Root data-slot="label" {...props} />;
}
