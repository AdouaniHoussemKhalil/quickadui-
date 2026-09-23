import { describe, expect, it } from "vitest";

/**
 * `SortableList`'s reorder logic is exercised indirectly here, at the
 * array-math level, rather than by simulating a real pointer/keyboard drag
 * through `@dnd-kit` in jsdom — same reasoning as `@quickadui/shell`'s
 * `widget-grid.test.ts`, which this test mirrors: `SortableList`'s
 * `handleDragEnd` does exactly this lookup-then-`arrayMove`, so this test
 * locks in that "old index, new index" contract against a plain array,
 * independent of dnd-kit.
 */
function reorder(items: string[], activeId: string, overId: string): string[] | null {
  if (activeId === overId) {
    return null;
  }
  const oldIndex = items.indexOf(activeId);
  const newIndex = items.indexOf(overId);
  if (oldIndex === -1 || newIndex === -1) {
    return null;
  }
  const next = items.slice();
  next.splice(oldIndex, 1);
  next.splice(newIndex, 0, items[oldIndex] as string);
  return next;
}

describe("SortableList's reorder math", () => {
  it("moves the dragged item to the target's position", () => {
    expect(reorder(["a", "b", "c", "d"], "a", "c")).toEqual(["b", "c", "a", "d"]);
  });

  it("moves an item backward the same way as forward", () => {
    expect(reorder(["a", "b", "c", "d"], "d", "b")).toEqual(["a", "d", "b", "c"]);
  });

  it("is a no-op when dropped on itself", () => {
    expect(reorder(["a", "b", "c"], "b", "b")).toBeNull();
  });

  it("is a no-op when either id is unknown", () => {
    expect(reorder(["a", "b", "c"], "z", "b")).toBeNull();
    expect(reorder(["a", "b", "c"], "a", "z")).toBeNull();
  });
});
