"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon } from "@quickadui/icons";
import { cn } from "@quickadui/utils";
import type { ComponentProps, ReactNode } from "react";

export interface WidgetProps extends Omit<ComponentProps<"div">, "id" | "title"> {
  /**
   * Stable id — must match this widget's entry in its `WidgetGrid`'s
   * `items` array (see `widget-grid.tsx`). Required (not optional) even
   * though a `Widget` can technically render outside a `WidgetGrid`,
   * since `useSortable` needs it unconditionally below and there's no
   * sane default id to fall back to.
   */
  id: string;
  /** Rendered in the header, next to the drag handle. */
  title?: ReactNode | undefined;
  /** Rendered on the header's trailing edge — a menu button, a badge, a "remove widget" control, etc. */
  actions?: ReactNode | undefined;
  /** Hides the drag handle and disables dragging for just this widget, even inside an otherwise-draggable `WidgetGrid`. Default: `false`. */
  disableDrag?: boolean | undefined;
  /**
   * Internal — set by `WidgetGrid`'s `DragOverlay` to render this widget
   * as a static, non-interactive preview while it's actually being
   * dragged elsewhere in the grid, instead of participating in sortable
   * layout itself (every real `Widget` in the grid keeps calling
   * `useSortable` as normal; only the floating overlay clone sets this).
   * Consumers building custom `DragOverlay` content of their own are the
   * only other reason to pass this directly. Default: `false`.
   */
  dragOverlay?: boolean | undefined;
}

/**
 * One card in a `WidgetGrid` (see `widget-grid.tsx`) — a header (drag
 * handle + `title` + `actions`) over a body (`children`). Meant to be
 * used as a direct child of `WidgetGrid`; `useSortable` is called
 * unconditionally (with `disabled: true` when `disableDrag`/`dragOverlay`
 * is set, rather than skipping the hook call — conditionally calling a
 * hook based on a prop is a rules-of-hooks violation) so every `Widget`
 * needs a `WidgetGrid`/`DndContext` ancestor to behave correctly, even
 * one rendered with `disableDrag`.
 */
export function Widget({
  id,
  title,
  actions,
  disableDrag = false,
  dragOverlay = false,
  className,
  children,
  ...props
}: WidgetProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
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
    <div
      ref={dragOverlay ? undefined : setNodeRef}
      style={style}
      data-slot="widget"
      data-dragging={dragOverlay ? true : isDragging}
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border border-neutral-6 bg-neutral-1",
        (dragOverlay || isDragging) && "shadow-lg",
        !dragOverlay && isDragging && "opacity-50",
        className,
      )}
      {...props}
    >
      <div data-slot="widget-header" className="flex items-center gap-2 border-b border-neutral-6 px-4 py-3">
        {!disableDrag && (
          <button
            type="button"
            ref={dragOverlay ? undefined : setActivatorNodeRef}
            data-slot="widget-drag-handle"
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
        {title !== undefined && (
          <div data-slot="widget-title" className="flex-1 truncate text-sm font-medium text-neutral-12">
            {title}
          </div>
        )}
        {actions}
      </div>
      <div data-slot="widget-body" className="flex-1 p-4">
        {children}
      </div>
    </div>
  );
}
