import { describe, expect, it } from "vitest";
import { toggleExpanded } from "./tree-view";

describe("toggleExpanded", () => {
  it("adds an id that isn't in the set", () => {
    const result = toggleExpanded(new Set(), "a");
    expect(result.has("a")).toBe(true);
  });

  it("removes an id that is already in the set", () => {
    const result = toggleExpanded(new Set(["a", "b"]), "a");
    expect(result.has("a")).toBe(false);
    expect(result.has("b")).toBe(true);
  });

  it("does not mutate the input set", () => {
    const input = new Set(["a"]);
    toggleExpanded(input, "b");
    expect(input.has("b")).toBe(false);
    expect(input.size).toBe(1);
  });

  it("returns a new Set instance", () => {
    const input = new Set(["a"]);
    const result = toggleExpanded(input, "a");
    expect(result).not.toBe(input);
  });
});
