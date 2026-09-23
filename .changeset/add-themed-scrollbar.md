---
"@quickadui/theme": minor
---

Add `generateScrollbarCss()` and a new optional `@quickadui/theme/scrollbar.css` export that themes the browser's native scrollbar (Firefox `scrollbar-color`/`scrollbar-width` and the WebKit `::-webkit-scrollbar` family) using the same `--qa-color-*` custom properties as the rest of the design system, so it follows light/dark mode and runtime accent-color overrides automatically.
