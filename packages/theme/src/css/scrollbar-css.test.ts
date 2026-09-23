import { describe, expect, it } from "vitest";
import { generateScrollbarCss } from "./scrollbar-css";

describe("generateScrollbarCss", () => {
  const css = generateScrollbarCss();

  it("themes the Firefox scrollbar via inherited :root properties", () => {
    expect(css).toContain(":root {");
    expect(css).toContain("scrollbar-color: var(--qa-color-accent-9) var(--qa-color-neutral-3);");
    expect(css).toContain("scrollbar-width: thin;");
  });

  it("themes the WebKit/Blink scrollbar on every scrollable element, not just the page", () => {
    expect(css).toContain("*::-webkit-scrollbar {");
    expect(css).toContain("*::-webkit-scrollbar-track {");
    expect(css).toContain("*::-webkit-scrollbar-thumb {");
    expect(css).toContain("*::-webkit-scrollbar-thumb:hover {");
  });

  it("only ever references live --qa-* custom properties, never a hardcoded literal color", () => {
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(css).toContain("var(--qa-color-accent-9)");
    expect(css).toContain("var(--qa-color-accent-10)");
    expect(css).toContain("var(--qa-color-neutral-3)");
    expect(css).toContain("var(--qa-radius-full)");
  });

  it("produces syntactically balanced braces", () => {
    const opens = css.split("{").length - 1;
    const closes = css.split("}").length - 1;
    expect(opens).toBe(closes);
  });
});
