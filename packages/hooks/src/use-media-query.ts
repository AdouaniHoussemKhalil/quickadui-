import { useCallback, useSyncExternalStore } from "react";

export interface UseMediaQueryOptions {
  /** Value returned before the query can be evaluated (SSR, or no `matchMedia`). Default `false`. */
  defaultValue?: boolean;
}

/**
 * Subscribes to a CSS media query and re-renders when it changes — built on
 * `useSyncExternalStore` (rather than `useState` + `useEffect`) so it's
 * correct under concurrent rendering and never shows a stale value for one
 * frame after mount. See `@quickadui/theme`'s `dom.ts` for the same
 * `matchMedia` subscription pattern applied specifically to theme mode.
 */
export function useMediaQuery(query: string, options: UseMediaQueryOptions = {}): boolean {
  const { defaultValue = false } = options;

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (typeof window === "undefined" || !window.matchMedia) return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onStoreChange);
      return () => mql.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined" || !window.matchMedia) return defaultValue;
    return window.matchMedia(query).matches;
  }, [query, defaultValue]);

  const getServerSnapshot = useCallback(() => defaultValue, [defaultValue]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
