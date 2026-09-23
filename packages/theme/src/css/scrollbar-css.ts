/**
 * A ready-made, theme-reactive stylesheet for the browser's *native*
 * scrollbar — Firefox's `scrollbar-color`/`scrollbar-width` and the
 * WebKit/Blink `::-webkit-scrollbar` family — so a default QuickadUI app
 * doesn't ship the browser's flat gray scrollbar next to an otherwise
 * fully themed UI.
 *
 * Every color is a `var(--qa-color-*)` reference back into `tokens.css`
 * (see `generateTokensCss`), exactly like `generateTailwindTheme`'s
 * `@theme` block — so the scrollbar follows light/dark mode and any
 * runtime `setColor("accent", ...)` override automatically, no rebuild and
 * no extra wiring. `scrollbar-color`/`scrollbar-width` are inherited CSS
 * properties, so declaring them once on `:root` is enough to theme every
 * scrollable element in Firefox; `::-webkit-scrollbar` isn't inherited, so
 * the WebKit/Blink half targets the universal selector directly instead —
 * exactly as broad, every scrollable element rather than just the page.
 *
 * Ships pre-rendered as `dist/scrollbar.css`, a separate opt-in import
 * (see the README) rather than folded into `tokens.css` itself — an app
 * that already has its own scrollbar styling, or wants to keep the OS
 * default, shouldn't have to fight or override this to opt out.
 *
 * Unlike `generateTokensCss`/`generateTailwindTheme`, this doesn't take a
 * `tokens` argument: nothing here varies per token value, only which CSS
 * custom properties get referenced, and those names are fixed regardless
 * of what `tokens.colors.accent`/`tokens.colors.neutral` actually resolve
 * to at runtime.
 */
export function generateScrollbarCss(): string {
  return [
    `:root {`,
    `  scrollbar-color: var(--qa-color-accent-9) var(--qa-color-neutral-3);`,
    `  scrollbar-width: thin;`,
    `}`,
    ``,
    `*::-webkit-scrollbar {`,
    `  width: 10px;`,
    `  height: 10px;`,
    `}`,
    ``,
    `*::-webkit-scrollbar-track {`,
    `  background: var(--qa-color-neutral-3);`,
    `}`,
    ``,
    `*::-webkit-scrollbar-thumb {`,
    `  background-color: var(--qa-color-accent-9);`,
    `  border-radius: var(--qa-radius-full);`,
    `  border: 2px solid var(--qa-color-neutral-3);`,
    `  background-clip: padding-box;`,
    `}`,
    ``,
    `*::-webkit-scrollbar-thumb:hover {`,
    `  background-color: var(--qa-color-accent-10);`,
    `}`,
    ``,
    `*::-webkit-scrollbar-corner {`,
    `  background: var(--qa-color-neutral-3);`,
    `}`,
    ``,
  ].join("\n");
}
