"use client";

import { CheckIcon, CopyIcon } from "@quickadui/icons";
import { cn } from "@quickadui/utils";
import { useState } from "react";
import { IconButton, type IconButtonProps } from "./icon-button";

export interface CopyButtonProps extends Omit<IconButtonProps, "aria-label" | "children" | "onClick"> {
  /** The text copied to the clipboard when clicked. */
  value: string;
  /** How long the check-mark confirmation shows before reverting to the copy icon, in ms. Default: `1500`. */
  resetAfter?: number;
  /**
   * Called after a successful copy. Named `onCopied` (not `onCopy`) because
   * `onCopy` is already the native DOM clipboard event
   * (`ClipboardEventHandler`) inherited from the underlying `<button>` —
   * reusing that name would collide with an incompatible signature.
   */
  onCopied?: (value: string) => void;
}

/**
 * An icon button that copies `value` to the clipboard via the
 * `navigator.clipboard` API and swaps to a check mark for `resetAfter`ms
 * as confirmation. Falls back to a hidden-textarea + `execCommand("copy")`
 * when `navigator.clipboard` isn't available (an insecure — non-HTTPS,
 * non-localhost — context, or an older browser); if that also fails,
 * `copied` never flips and no error is thrown.
 */
export function CopyButton({
  value,
  resetAfter = 1500,
  onCopied,
  variant = "ghost",
  size = "sm",
  className,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    const ok = await copyToClipboard(value);
    if (!ok) {
      return;
    }
    setCopied(true);
    onCopied?.(value);
    window.setTimeout(() => setCopied(false), resetAfter);
  }

  return (
    <IconButton
      type="button"
      variant={variant}
      size={size}
      aria-label={copied ? "Copied" : "Copy"}
      data-slot="copy-button"
      data-copied={copied}
      className={cn(copied && "text-success-11", className)}
      onClick={handleClick}
      {...props}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </IconButton>
  );
}

/**
 * Exported for its own sake (a consumer building a custom copy affordance
 * can reuse it) as much as for testability. Prefers the modern async
 * Clipboard API and falls back to the classic hidden-textarea +
 * `execCommand("copy")` trick, which is still the only thing that works
 * in a couple of embedded/older-WebView contexts the Clipboard API
 * refuses in.
 */
export async function copyToClipboard(value: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // Fall through to the execCommand fallback below — a rejected
      // clipboard promise (permission denied, insecure context in some
      // browsers) shouldn't be a dead end.
    }
  }
  if (typeof document === "undefined") {
    return false;
  }
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(textarea);
  return ok;
}
