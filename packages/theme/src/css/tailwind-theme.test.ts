import { tokens } from "@quickadui/tokens";
import { describe, expect, it } from "vitest";
import { generateTailwindTheme } from "./tailwind-theme";

describe("generateTailwindTheme", () => {
  const css = generateTailwindTheme(tokens);

  it("wraps everything in a single @theme block", () => {
    expect(css.startsWith("@theme {")).toBe(true);
    expect(css.trim().endsWith("}")).toBe(true);
  });

  it("maps every color step to a var() reference into the runtime stylesheet, never a literal", () => {
    for (const family of Object.keys(tokens.colors)) {
      for (let step = 1; step <= 12; step++) {
        expect(css).toContain(`--color-${family}-${step}: var(--qa-color-${family}-${step});`);
      }
    }
    // no stray hex literals leaked into the theme block itself
    expect(css).not.toMatch(/#[0-9A-Fa-f]{6}/);
  });

  it("derives the Tailwind spacing multiplier from the token spacing scale", () => {
    expect(css).toContain("--spacing: var(--qa-spacing-1);");
  });

  it("pairs each font size with its line-height using Tailwind v4's -- separator", () => {
    for (const key of Object.keys(tokens.fontSize)) {
      const safe = key.replace(".", "_");
      expect(css).toContain(`--text-${safe}--line-height: var(--qa-text-${safe}-line-height);`);
    }
  });

  it("does not emit a duration namespace (Tailwind v4 has none)", () => {
    expect(css).not.toContain("--duration-");
  });

  it("produces syntactically balanced braces", () => {
    const opens = css.split("{").length - 1;
    const closes = css.split("}").length - 1;
    expect(opens).toBe(closes);
  });
});
