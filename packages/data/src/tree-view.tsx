"use client";

import { ChevronRightIcon } from "@quickadui/icons";
import { cn } from "@quickadui/utils";
import { createContext, useContext, useState, type ComponentProps, type ReactNode } from "react";

/**
 * Pure — toggles one id in/out of a `Set` without mutating the original,
 * the way a React state setter expects. Exported and unit-tested
 * directly (see `tree-view.test.ts`) since it's the one piece of real
 * logic `TreeView`'s expand/collapse state is built on; everything else
 * in this file is layout and event wiring.
 */
export function toggleExpanded(expandedIds: ReadonlySet<string>, id: string): Set<string> {
  const next = new Set(expandedIds);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  return next;
}

interface TreeViewContextValue {
  expandedIds: ReadonlySet<string>;
  toggle: (id: string) => void;
  // Both explicitly `| undefined`, not just `?:` — the context value
  // object below is built from `TreeViewProps`' own (also optional)
  // `selectedId`/`onSelect`, which read as `string | undefined` /
  // `((id: string) => void) | undefined` once destructured, and handing
  // an explicit `undefined` into a property typed only `string` (even
  // an optional one) is a real `exactOptionalPropertyTypes` violation —
  // same class of bug as `@quickadui/forms`' `form.tsx` `useFormState`
  // fix and `@quickadui/overlays`' `toaster.tsx` `duration` fix.
  selectedId?: string | undefined;
  onSelect?: ((id: string) => void) | undefined;
}

const TreeViewContext = createContext<TreeViewContextValue | null>(null);

function useTreeViewContext(): TreeViewContextValue {
  const context = useContext(TreeViewContext);
  if (!context) {
    throw new Error("TreeViewItem must be used within a <TreeView>");
  }
  return context;
}

export interface TreeViewProps extends Omit<ComponentProps<"ul">, "onSelect"> {
  /** Uncontrolled starting set of expanded node ids — ignored once `expandedIds` is passed (controlled mode). */
  defaultExpandedIds?: string[];
  /** Controlled expanded-node-id set. Pass together with `onExpandedIdsChange` to drive it from outside. */
  expandedIds?: ReadonlySet<string>;
  onExpandedIdsChange?: (expandedIds: ReadonlySet<string>) => void;
  // Both explicitly `| undefined`, not just `?:` — a controlled consumer
  // typically holds this in `useState<string | undefined>()`, which
  // makes passing it back in as `selectedId={selectedId}` assign a
  // `string | undefined` value under `exactOptionalPropertyTypes`, same
  // bug class as `TreeViewContextValue` below (and `@quickadui/forms`'
  // `form.tsx`/`@quickadui/overlays`' `toaster.tsx` before that) — this
  // one only surfaces from a real *consumer* usage, not from this file's
  // own internals, which is exactly why it slipped through the first
  // time: nothing inside `tree-view.tsx` itself ever assigns `undefined`
  // to these two fields.
  selectedId?: string | undefined;
  onSelect?: ((id: string) => void) | undefined;
}

export function TreeView({
  className,
  defaultExpandedIds,
  expandedIds: expandedIdsProp,
  onExpandedIdsChange,
  selectedId,
  onSelect,
  ...props
}: TreeViewProps) {
  const [uncontrolledExpandedIds, setUncontrolledExpandedIds] = useState<ReadonlySet<string>>(() => new Set(defaultExpandedIds ?? []));
  const isControlled = expandedIdsProp !== undefined;
  const expandedIds = isControlled ? expandedIdsProp : uncontrolledExpandedIds;

  const toggle = (id: string) => {
    const next = toggleExpanded(expandedIds, id);
    if (!isControlled) {
      setUncontrolledExpandedIds(next);
    }
    onExpandedIdsChange?.(next);
  };

  return (
    <TreeViewContext.Provider value={{ expandedIds, toggle, selectedId, onSelect }}>
      <ul role="tree" data-slot="tree-view" className={cn("flex flex-col gap-0.5 text-sm", className)} {...props} />
    </TreeViewContext.Provider>
  );
}

export interface TreeViewItemProps extends Omit<ComponentProps<"li">, "children"> {
  nodeId: string;
  label: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
}

export function TreeViewItem({ className, nodeId, label, icon, children, ...props }: TreeViewItemProps) {
  const { expandedIds, toggle, selectedId, onSelect } = useTreeViewContext();
  const hasChildren = children !== undefined && children !== null;
  const expanded = expandedIds.has(nodeId);
  const isSelected = selectedId === nodeId;

  return (
    <li role="treeitem" aria-expanded={hasChildren ? expanded : undefined} aria-selected={isSelected} data-slot="tree-view-item" className={className} {...props}>
      <div
        className={cn("flex cursor-pointer items-center gap-1 rounded-sm px-2 py-1.5 hover:bg-neutral-3", isSelected && "bg-accent-3 text-accent-11")}
        onClick={() => onSelect?.(nodeId)}
      >
        {hasChildren ? (
          <button
            type="button"
            aria-label={expanded ? "Collapse" : "Expand"}
            className="flex size-4 shrink-0 items-center justify-center text-neutral-11"
            onClick={(event: { stopPropagation: () => void }) => {
              // Structurally typed instead of React's real `MouseEvent<HTMLButtonElement>`
              // — the local react-stub's `JSX.IntrinsicElements` is a
              // permissive `[elemName: string]: any` (see `react.d.ts`), so
              // a hardcoded `<button onClick={...}>` (not routed through
              // `ComponentProps<"button">`) gets no contextual parameter
              // type at all under this stub, and `noImplicitAny` correctly
              // flags the bare `(event) => ...` as a result. Only
              // `stopPropagation` is actually used, so it's typed to just
              // that.
              event.stopPropagation();
              toggle(nodeId);
            }}
          >
            <ChevronRightIcon size={14} className={cn("transition-transform", expanded && "rotate-90")} />
          </button>
        ) : (
          <span className="size-4 shrink-0" />
        )}
        {icon}
        <span className="truncate">{label}</span>
      </div>
      {hasChildren && expanded && (
        <ul role="group" className="ml-4 flex flex-col gap-0.5 border-l border-neutral-6 pl-2">
          {children}
        </ul>
      )}
    </li>
  );
}
