import type { tokens as TokensShape } from "@quickadui/tokens";

type Tokens = typeof TokensShape;

/** `0.5` -> `0_5` — dots aren't valid in a CSS custom-property identifier. */
function safeKey(key: string | number): string {
  return String(key).replace(".", "_");
}

function colorVars(tokens: Tokens, mode: "light" | "dark"): string[] {
  const lines: string[] = [];
  for (const [family, scale] of Object.entries(tokens.colors)) {
    scale[mode].forEach((hex, i) => {
      lines.push(`  --qa-color-${family}-${i + 1}: ${hex};`);
    });
  }
  return lines;
}

/** Tokens that don't change between light and dark — declared once. */
function invariantVars(tokens: Tokens): string[] {
  const lines: string[] = [];

  for (const [key, px] of Object.entries(tokens.spacing)) {
    lines.push(`  --qa-spacing-${safeKey(key)}: ${px}px;`);
  }
  for (const [key, px] of Object.entries(tokens.radius)) {
    lines.push(`  --qa-radius-${key}: ${px}px;`);
  }
  for (const [key, value] of Object.entries(tokens.fontFamily)) {
    lines.push(`  --qa-font-${key}: ${value};`);
  }
  for (const [key, { size, lineHeight }] of Object.entries(tokens.fontSize)) {
    lines.push(`  --qa-text-${safeKey(key)}: ${size}px;`);
    lines.push(`  --qa-text-${safeKey(key)}-line-height: ${lineHeight}px;`);
  }
  for (const [key, weight] of Object.entries(tokens.fontWeight)) {
    lines.push(`  --qa-font-weight-${key}: ${weight};`);
  }
  for (const [key, ms] of Object.entries(tokens.duration)) {
    lines.push(`  --qa-duration-${key}: ${ms}ms;`);
  }
  for (const [key, curve] of Object.entries(tokens.easing)) {
    lines.push(`  --qa-ease-${key}: ${curve};`);
  }

  return lines;
}

/**
 * Renders the full runtime token stylesheet: light values and invariant
 * tokens in `:root`, dark values under both `prefers-color-scheme` (guarded
 * so an explicit `data-theme="light"` still wins) and `[data-theme="dark"]`
 * (so the toggle wins the other way too). This is the same three-state
 * pattern used throughout the QuickadUI Blueprint's own theming — see §7.
 */
export function generateTokensCss(tokens: Tokens): string {
  const light = colorVars(tokens, "light");
  const dark = colorVars(tokens, "dark");
  const invariant = invariantVars(tokens);

  return [
    `:root {`,
    ...light,
    ...invariant,
    `}`,
    ``,
    `@media (prefers-color-scheme: dark) {`,
    `  :root:not([data-theme="light"]) {`,
    ...dark.map((l) => `  ${l}`),
    `  }`,
    `}`,
    ``,
    `:root[data-theme="dark"] {`,
    ...dark,
    `}`,
    ``,
  ].join("\n");
}
