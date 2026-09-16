"use client";

import { CheckIcon, MinusIcon } from "@quickadui/icons";
import { CheckboxIndicator as CheckboxIndicatorPrimitive, CheckboxRoot as CheckboxRootPrimitive } from "@quickadui/primitives";
import { cn } from "@quickadui/utils";
import type { ComponentProps } from "react";

/**
 * `checked` is read (not destructured out) so it stays in `...props` and
 * still reaches `CheckboxRootPrimitive` unchanged — same
 * `exactOptionalPropertyTypes`-safe pattern as `core`'s
 * `DropdownMenuCheckboxItem`.
 *
 * Known gap: the icon choice below only reacts to *controlled* `checked`.
 * An uncontrolled checkbox started via `defaultChecked="indeterminate"`
 * would render the check mark instead of the dash until first toggled —
 * indeterminate is essentially always driven by external computed state
 * in practice (it isn't something a user can toggle to directly), so this
 * hasn't been worth a CSS-only fix.
 */
export function Checkbox({ className, ...props }: ComponentProps<typeof CheckboxRootPrimitive>) {
  return (
    <CheckboxRootPrimitive
      className={cn(
        "peer flex size-4 shrink-0 items-center justify-center rounded-sm border border-neutral-7 bg-neutral-1 shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-8 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-accent-9 data-[state=checked]:bg-accent-9 data-[state=checked]:text-white data-[state=indeterminate]:border-accent-9 data-[state=indeterminate]:bg-accent-9 data-[state=indeterminate]:text-white",
        className,
      )}
      {...props}
    >
      <CheckboxIndicatorPrimitive className="flex items-center justify-center text-current">
        {props.checked === "indeterminate" ? <MinusIcon size={12} /> : <CheckIcon size={12} />}
      </CheckboxIndicatorPrimitive>
    </CheckboxRootPrimitive>
  );
}
