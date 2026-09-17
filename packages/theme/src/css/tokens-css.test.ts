import { tokens } from "@quickadui/tokens";
import { describe, expect, it } from "vitest";
import { generateTokensCss } from "./tokens-css";

describe("generateTokensCss", () => {
  const css = generateTokensCss(tokens);

  it("declares a :root block, a prefers-color-scheme block, and a [data-theme=dark] block", () => {
    expect(css).toContain(":root {");
    expect(css).toContain(
      '@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]) {',
    );
    expect(css).toContain(':root[data-theme="dark"] {');
  });

  it("emits all 12 steps for every color family, in :root", () => {
    for (const family of Object.keys(tokens.colors)) {
      for (let step = 1; step <= 12; step++) {
        expect(css).toContain(`--qa-color-${family}-${step}:`);
      }
    }
  });

  it("emits spacing, radius, typography and motion tokens exactly once (they don't vary by theme)", () => {
    const occurrences = (needle: string) => css.split(needle).length - 1;
    expect(occurrences("--qa-spacing-4:")).toBe(1);
    expect(occurrences("--qa-radius-md:")).toBe(1);
    expect(occurrences("--qa-font-sans:")).toBe(1);
    expect(occurrences("--qa-duration-base:")).toBe(1);
  });

  it("sanitizes dotted keys (0.5 -> 0_5) into valid CSS identifiers", () => {
    expect(css).toContain("--qa-spacing-0_5:");
    expect(css).not.toContain("--qa-spacing-0.5:");
  });

  it("produces syntactically balanced braces", () => {
    const opens = css.split("{").length - 1;
    const closes = css.split("}").length - 1;
    expect(opens).toBe(closes);
  });
});
