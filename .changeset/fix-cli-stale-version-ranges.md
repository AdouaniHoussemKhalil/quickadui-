---
"create-quickadui": patch
---

Fix `quickadui add`'s package registry (`packages.ts`), which had every version range hardcoded to `^0.1.0` — since `^0.1.0` never matches a `0.2.0` release (semver's special-case rule for `0.x` versions), `quickadui add core` (and friends) was silently installing the old 0.1.0 line even after `@quickadui/core`, `@quickadui/data`, `@quickadui/forms`, `@quickadui/primitives`, and `@quickadui/theme` shipped 0.2.0 on npm. Ranges now match what's actually published: `^0.2.0` for those five packages, `^0.1.1` for `@quickadui/layout`/`@quickadui/overlays` (their own patch bump from the same release), unchanged elsewhere.
