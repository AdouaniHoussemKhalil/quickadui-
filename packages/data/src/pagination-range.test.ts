import { describe, expect, it } from "vitest";
import { getPaginationRange, PAGINATION_ELLIPSIS } from "./pagination-range";

describe("getPaginationRange", () => {
  it("returns [] for totalPages <= 0", () => {
    expect(getPaginationRange(1, 0)).toEqual([]);
  });

  it("returns the full range when it already fits within the slot budget", () => {
    expect(getPaginationRange(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getPaginationRange(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("shows only a right ellipsis when the current page is near the start", () => {
    expect(getPaginationRange(1, 10)).toEqual([1, 2, 3, 4, 5, PAGINATION_ELLIPSIS, 10]);
  });

  it("shows only a left ellipsis when the current page is near the end", () => {
    expect(getPaginationRange(10, 10)).toEqual([1, PAGINATION_ELLIPSIS, 6, 7, 8, 9, 10]);
  });

  it("shows both ellipses when the current page is in the middle", () => {
    expect(getPaginationRange(5, 10)).toEqual([1, PAGINATION_ELLIPSIS, 4, 5, 6, PAGINATION_ELLIPSIS, 10]);
  });

  it("always includes the current page and its siblings even mid-range", () => {
    const result = getPaginationRange(5, 10);
    expect(result).toContain(4);
    expect(result).toContain(5);
    expect(result).toContain(6);
  });

  it("respects a larger siblingCount", () => {
    expect(getPaginationRange(5, 10, 2)).toEqual([1, PAGINATION_ELLIPSIS, 3, 4, 5, 6, 7, PAGINATION_ELLIPSIS, 10]);
  });

  it("always includes the first and last page once ellipses are in play", () => {
    const result = getPaginationRange(5, 20);
    expect(result[0]).toBe(1);
    expect(result.at(-1)).toBe(20);
  });
});
