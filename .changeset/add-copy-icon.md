---
"@quickadui/icons": minor
---

Add `CopyIcon`, used by `@quickadui/core`'s `CopyButton`/`CopyField` (added in `@quickadui/core@0.2.0`). It existed in source since that release but was never itself released, so `@quickadui/core@0.2.0` shipped with a `"@quickadui/icons": "workspace:*"` dependency that resolved to the pre-`CopyIcon` `0.1.0` on npm, causing a `[MISSING_EXPORT] "CopyIcon" is not exported by "@quickadui/icons"` bundling error for anyone installing `@quickadui/core` fresh.
