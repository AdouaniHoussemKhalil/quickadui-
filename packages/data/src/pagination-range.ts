export const PAGINATION_ELLIPSIS = "ellipsis" as const;
export type PaginationRangeItem = number | typeof PAGINATION_ELLIPSIS;

/**
 * Computes which page numbers `Pagination` should render, and where an
 * ellipsis belongs — the classic "sibling + boundary" algorithm most
 * pagination UIs converge on (MUI's `usePagination`, Chakra, and most
 * hand-rolled implementations use close variants of this). Always
 * includes the first and last page and `siblingCount` pages on each side
 * of `currentPage`; collapses any gap wider than one page into a single
 * `"ellipsis"` entry instead of listing every skipped page. Pure and
 * React-free on purpose, so it's unit-tested directly (see
 * `pagination-range.test.ts`) rather than through rendered output.
 */
export function getPaginationRange(currentPage: number, totalPages: number, siblingCount = 1): PaginationRangeItem[] {
  if (totalPages <= 0) {
    return [];
  }

  const totalSlots = siblingCount * 2 + 5; // first + last + current + siblings on both sides + room for both ellipses

  if (totalPages <= totalSlots) {
    return range(1, totalPages);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const showLeftEllipsis = leftSiblingIndex > 2;
  const showRightEllipsis = rightSiblingIndex < totalPages - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftItemCount = 3 + siblingCount * 2;
    return [...range(1, leftItemCount), PAGINATION_ELLIPSIS, totalPages];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightItemCount = 3 + siblingCount * 2;
    return [1, PAGINATION_ELLIPSIS, ...range(totalPages - rightItemCount + 1, totalPages)];
  }

  return [1, PAGINATION_ELLIPSIS, ...range(leftSiblingIndex, rightSiblingIndex), PAGINATION_ELLIPSIS, totalPages];
}

function range(start: number, end: number): number[] {
  const length = end - start + 1;
  return Array.from({ length }, (_, i) => start + i);
}
