"use client";

import type { DragCancelEvent, DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@quickadui/utils";
import type { ComponentProps, ReactElement, ReactNode } from "react";
import { Children, cloneElement, isValidElement, useState } from "react";
import type { SortableItemProps } from "./sortable-item";

export interface SortableListProps extends ComponentProps<"ul"> {
  /**
   * Ordered item ids — must match the `id` prop of each `SortableItem`
   * child, in the same order they're rendered. Same contract as
   * `@quickadui/shell`'s `WidgetGrid`: a completed drag never reorders
   * anything by itself, it only computes the new order and hands it to
   * `onReorder` for you to store and pass back in on the next render
   * (same reasoning as a controlled form input).
   */
  items: string[];
  /**
   * Called with the reordered id array once a drag-and-drop completes.
   * Omit it to render a plain, non-draggable list (no `DndContext` is
   * mounted at all in that case) — useful for a read-only list, or while
   * you haven't wired up persistence for the order yet.
   */
  onReorder?: ((items: string[]) => void) | undefined;
}

/**
 * A vertical list of `SortableItem` children (see `sortable-item.tsx`),
 * draggable with the mouse/pointer and the keyboard via
 * `@dnd-kit/core`/`@dnd-kit/sortable` — the same drag machinery
 * `@quickadui/shell`'s `WidgetGrid` uses for a 2D grid of dashboard
 * widgets, here specialized for a single-column list (a reorderable
 * settings list, a priority-ranked list, a Kanban column, ...). A
 * floating `DragOverlay` clone of the item being dragged follows the
 * pointer/focus while the list itself just fades the original in place.
 */
export function SortableList({
  items,
  onReorder,
  className,
  children,
  ...props
}: SortableListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const list = (
    <ul data-slot="sortable-list" className={cn("flex flex-col gap-2", className)} {...props}>
      {children}
    </ul>
  );

  if (!onReorder) {
    return list;
  }

  // Captured into a real `const` so the nested handlers below can rely on
  // it staying non-undefined — same reasoning as `WidgetGrid`'s own
  // `reorder` const.
  const reorder = onReorder;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const oldIndex = items.indexOf(String(active.id));
    const newIndex = items.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }
    reorder(arrayMove(items, oldIndex, newIndex));
  }

  function handleDragCancel(_event: DragCancelEvent) {
    setActiveId(null);
  }

  const activeChild = activeId === null ? null : findItemById(children, activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {list}
      </SortableContext>
      <DragOverlay>
        {activeChild ? cloneElement(activeChild, { dragOverlay: true }) : null}
      </DragOverlay>
    </DndContext>
  );
}

function findItemById(children: ReactNode, id: string): ReactElement<SortableItemProps> | null {
  let found: ReactElement<SortableItemProps> | null = null;
  Children.forEach(children, (child) => {
    if (found || !isValidElement<SortableItemProps>(child)) {
      return;
    }
    if (child.props.id === id) {
      found = child;
    }
  });
  return found;
}
