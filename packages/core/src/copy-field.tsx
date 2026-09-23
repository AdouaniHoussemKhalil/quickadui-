"use client";

import { cn } from "@quickadui/utils";
import type { ComponentProps } from "react";
import { CopyButton, type CopyButtonProps } from "./copy-button";

export interface CopyFieldProps extends Omit<ComponentProps<"div">, "onCopy"> {
  /** The text shown and copied. */
  value: string;
  /** Forwarded to the embedded CopyButton — resetAfter, onCopy, etc. */
  copyButtonProps?: Omit<CopyButtonProps, "value"> | undefined;
}

/**
 * A read-only value (an API key, an invite link, a command) shown in a
 * bordered, monospace field with a `CopyButton` on its trailing edge —
 * the "text to copy, with a copy icon" pattern. For copy affordances
 * elsewhere (a table cell, a code block's corner) that don't need the
 * bordered field chrome, use `CopyButton` directly instead.
 */
export function CopyField({ value, copyButtonProps, className, ...props }: CopyFieldProps) {
  return (
    <div
      data-slot="copy-field"
      className={cn(
        "flex items-center gap-2 rounded-md border border-neutral-7 bg-neutral-2 py-1.5 pl-3 pr-1.5",
        className,
      )}
      {...props}
    >
      <code
        data-slot="copy-field-value"
        className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-sm text-neutral-12"
      >
        {value}
      </code>
      <CopyButton value={value} {...copyButtonProps} />
    </div>
  );
}
