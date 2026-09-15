import type { tokens as TokensShape } from "@quickadui/tokens";

type Tokens = typeof TokensShape;

function safeKey(key: string | number): string {
  return String(key).replace(".", "_");
}

/**
 * Renders a Tailwind v4 `@theme` block. Every value is a `var(--qa-*)`
 * reference back into the runtime stylesheet from `tokens-css.ts`, never a
 * duplicated literal — so `bg-accent-9` and friends follow the same
 * light/dark switch as everything else, instead of freezing whatever value
 * was true at build time. See the QuickadUI Blueprint, §7.
 *
 * Consumers `@import` this after Tailwind itself:
 *
 *   @import "tailwindcss";
 *   @import "@quickadui/theme/tailwind-theme.css";
 *
 * Not every token category has a Tailwind v4 theme namespace — `duration`
 * has none as of v4, so it's left out here (it's still available as a
 * plain `--qa-duration-*` custom property from `tokens-css.ts`).
 */
export function generateTailwindTheme(tokens: Tokens): string {
  const lines: string[] = [`@theme {`];

  for (const [family, scale] of Object.entries(tokens.colors)) {
    scale.light.forEach((_hex, i) => {
      const step = i + 1;
      lines.push(`  --color-${family}-${step}: var(--qa-color-${family}-${step});`);
    });
  }

  // Tailwind's spacing scale is a single base multiplier, not discrete
  // named steps — QuickadUI's own spacing scale is exactly `step * 4px`
  // (see spacing.ts), so step "1" (4px) is that multiplier.
  lines.push(`  --spacing: var(--qa-spacing-1);`);

  for (const key of Object.keys(tokens.radius)) {
    lines.push(`  --radius-${key}: var(--qa-radius-${key});`);
  }

  for (const key of Object.keys(tokens.fontFamily)) {
    lines.push(`  --font-${key}: var(--qa-font-${key});`);
  }

  for (const key of Object.keys(tokens.fontSize)) {
    const safe = safeKey(key);
    lines.push(`  --text-${safe}: var(--qa-text-${safe});`);
    lines.push(`  --text-${safe}--line-height: var(--qa-text-${safe}-line-height);`);
  }

  for (const key of Object.keys(tokens.fontWeight)) {
    lines.push(`  --font-weight-${key}: var(--qa-font-weight-${key});`);
  }

  for (const key of Object.keys(tokens.easing)) {
    lines.push(`  --ease-${key}: var(--qa-ease-${key});`);
  }

  lines.push(`}`, ``);
  return lines.join("\n");
}
