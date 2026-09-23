"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon } from "@quickadui/icons";
import { cn } from "@quickadui/utils";
import type { ComponentProps } from "react";

export interface SortableItemProps extends Omit<ComponentProps<"li">, "id"> {
  /**
   * Stable id — must match this item's entry in its `SortableList`'s
   * `items` array (see `sortable-list.tsx`). Required even though a
   * `SortableItem` can technically render outside a `SortableList`, since
   * `useSortable` needs it unconditionally below and there's no sane
   * default id to fall back to.
   */
  id: string;
  /** Hides the drag handle and disables dragging for just this item, even inside an otherwise-draggable `SortableList`. Default: `false`. */
  disableDrag?: boolean | undefined;
  /**
   * Internal — set by `SortableList`'s `DragOverlay` to render this item
   * as a static, non-interactive preview while it's actually being
   * dragged elsewhere in the list, instead of participating in sortable
   * layout itself. Same pattern as `@quickadui/shell`'s `Widget`.
   * Default: `false`.
   */
  dragOverlay?: boolean | undefined;
}

/**
 * One row in a `SortableList` (see `sortable-list.tsx`) — a drag handle
 * beside `children`. Meant to be used as a direct child of `SortableList`;
 * `useSortable` is called unconditionally (with `disabled: true` when
 * `disableDrag`/`dragOverlay` is set, rather than skipping the hook call)
 * so every `SortableItem` needs a `SortableList`/`DndContext` ancestor to
 * behave correctly, even one rendered with `disableDrag`.
 */
export function SortableItem({
  id,
  disableDrag = false,
  dragOverlay = false,
  className,
  children,
  ...props
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: disableDrag || dragOverlay,
  });

  const style = dragOverlay
    ? undefined
    : {
        transform: CSS.Transform.toString(transform),
        transition,
      };

  return (
    <li
      ref={dragOverlay ? undefined : setNodeRef}
      style={style}
      data-slot="sortable-item"
      data-dragging={dragOverlay ? true : isDragging}
      className={cn(
        "flex items-center gap-2 rounded-md border border-neutral-6 bg-neutral-1 px-3 py-2",
        (dragOverlay || isDragging) && "shadow-lg",
        !dragOverlay && isDragging && "opacity-50",
        className,
      )}
      {...props}
    >
      {!disableDrag && (
        <button
          type="button"
          ref={dragOverlay ? undefined : setActivatorNodeRef}
          data-slot="sortable-item-drag-handle"
          aria-label="Drag to reorder"
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded text-neutral-9 hover:bg-neutral-3 hover:text-neutral-11",
            dragOverlay ? "cursor-grabbing" : "cursor-grab",
          )}
          {...(dragOverlay ? undefined : attributes)}
          {...(dragOverlay ? undefined : listeners)}
        >
          <GripVerticalIcon size={16} />
        </button>
      )}
      <div data-slot="sortable-item-content" className="min-w-0 flex-1">
        {children}
      </div>
    </li>
  );
}
