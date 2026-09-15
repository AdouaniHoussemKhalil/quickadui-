import { useEffect, useState } from "react";

/**
 * Returns a copy of `value` that only updates after `delayMs` of no further
 * changes — e.g. driving a search request off a text input without firing
 * one per keystroke. The *first* render always returns `value` itself
 * (unlike some debounce implementations, there's no initial delay before
 * the first value is usable).
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
