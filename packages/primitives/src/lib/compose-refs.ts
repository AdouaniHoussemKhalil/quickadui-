// Deliberately self-contained (no import from "react") — a ref-composing
// utility is exactly the kind of primitive-of-primitives that shouldn't
// depend on any particular React types module. `PossibleRef` covers both
// ref shapes React accepts: a callback, or a `{ current }` object.

export type RefCallback<T> = (node: T | null) => void | (() => void);
export type RefObject<T> = { current: T | null };
export type PossibleRef<T> = RefCallback<T> | RefObject<T> | null | undefined;

/**
 * Merges any number of refs pointing at the same node into a single ref
 * callback. Needed whenever a wrapper both forwards the ref a consumer
 * passed in *and* needs to hold its own ref on the same node — e.g. `Slot`
 * merging the `asChild` child's own ref with the one the wrapping component
 * received. Supports React 19's ref-cleanup-function return value: if any
 * composed ref returns a cleanup function, the composed callback returns
 * one too that runs all of them.
 */
export function composeRefs<T>(...refs: Array<PossibleRef<T>>): RefCallback<T> {
  return (node) => {
    const cleanups: Array<() => void> = [];
    for (const ref of refs) {
      if (typeof ref === "function") {
        const cleanup = ref(node);
        if (typeof cleanup === "function") cleanups.push(cleanup);
      } else if (ref !== null && ref !== undefined) {
        ref.current = node;
      }
    }
    if (cleanups.length > 0) {
      return () => {
        for (const cleanup of cleanups) cleanup();
      };
    }
  };
}
