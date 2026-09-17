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
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { cn } from "@quickadui/utils";
import type { ComponentProps, ReactElement, ReactNode } from "react";
import { Children, cloneElement, isValidElement, useState } from "react";
import type { WidgetProps } from "./widget";

export interface WidgetGridProps extends ComponentProps<"div"> {
  /**
   * Ordered widget ids — must match the `id` prop of each `Widget` child,
   * in the same order they're rendered. This is the single source of
   * truth for order: a completed drag never reorders anything by itself,
   * it only computes the new order and hands it to `onReorder` for you to
   * store and pass back in on the next render (same reasoning as a
   * controlled form input).
   */
  items: string[];
  /**
   * Called with the reordered id array once a drag-and-drop completes.
   * Omit it to render a plain, non-draggable grid (no `DndContext` is
   * mounted at all in that case) — useful for a read-only dashboard, or
   * while you haven't wired up persistence for the order yet.
   */
  onReorder?: ((items: string[]) => void) | undefined;
  /** Columns at the `md` breakpoint and up — always a single column below it. Default: `3`. */
  columns?: 1 | 2 | 3 | 4;
}

const COLUMNS_CLASS = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
} as const satisfies Record<1 | 2 | 3 | 4, string>;

/**
 * Lays out `Widget` children (see `widget.tsx`) in a responsive grid and,
 * whenever `onReorder` is given, makes them drag-and-drop sortable —
 * pointer (with a small activation-distance threshold so ordinary clicks
 * on widget content don't start a drag) and keyboard, via
 * `@dnd-kit/core`/`@dnd-kit/sortable`. A floating `DragOverlay` clone of
 * the widget being dragged follows the pointer/focus while the grid
 * itself just fades the original in place — this is `@dnd-kit`'s own
 * recommended pattern for sortable grids (as opposed to `DragOverlay`-
 * free dragging, which looks noticeably worse on a 2D grid vs. a single
 * list).
 */
export function WidgetGrid({
  items,
  onReorder,
  columns = 3,
  className,
  children,
  ...props
}: WidgetGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const grid = (
    <div
      data-slot="widget-grid"
      className={cn("grid grid-cols-1 gap-4", COLUMNS_CLASS[columns], className)}
      {...props}
    >
      {children}
    </div>
  );

  if (!onReorder) {
    return grid;
  }

  // Captured into a real `const` so the nested handlers below can rely on
  // it staying non-undefined — `onReorder` itself is a function parameter
  // (mutable in principle), so TypeScript won't carry the `if (!onReorder)
  // return` narrowing above into a closure defined later in this scope.
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

  const activeChild = activeId === null ? null : findWidgetById(children, activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={items} strategy={rectSortingStrategy}>
        {grid}
      </SortableContext>
      <DragOverlay>
        {activeChild ? cloneElement(activeChild, { dragOverlay: true }) : null}
      </DragOverlay>
    </DndContext>
  );
}

function findWidgetById(children: ReactNode, id: string): ReactElement<WidgetProps> | null {
  let found: ReactElement<WidgetProps> | null = null;
  Children.forEach(children, (child) => {
    if (found || !isValidElement<WidgetProps>(child)) {
      return;
    }
    if (child.props.id === id) {
      found = child;
    }
  });
  return found;
}
