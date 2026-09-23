---
"@quickadui/core": minor
---

Add `Collapsible`, `CopyButton`, and `CopyField` components.

**Breaking (0.x):** `CopyButtonProps.onCopy` has been renamed to `onCopied` to avoid colliding with the native DOM `onCopy` clipboard event, which was silently shadowing the intended callback. Update any existing `onCopy` usage to `onCopied`.
