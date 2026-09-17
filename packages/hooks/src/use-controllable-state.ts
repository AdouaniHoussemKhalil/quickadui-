import { useCallback, useState } from "react";

export interface UseControllableStateOptions<T> {
  /** Present (not `undefined`) means "controlled": the caller owns the value, this hook just relays it. */
  value?: T;
  /** Starting value when uncontrolled. Irrelevant once `value` is passed. */
  defaultValue?: T;
  /** Called on every change, controlled or not — the controlled caller's only way to find out. */
  onChange?: (value: T) => void;
}

export type SetControllableState<T> = (value: T | ((prev: T) => T)) => void;

/**
 * The controlled/uncontrolled duality every interactive component ends up
 * needing (`<input value={} onChange={}>` vs `<input defaultValue={}>`,
 * mirrored here) — Radix's primitives use the same pattern internally,
 * which is exactly why `@quickadui/primitives` never needed to expose it:
 * it's already load-bearing inside every Radix part this library wraps.
 * QuickadUI's *own* future stateful components (a `Tabs`, an uncontrolled
 * `Select`, ...) that aren't themselves Radix wrappers use this instead of
 * reinventing it per component.
 *
 * Whichever mode is active on mount is sticky: switching a component
 * between controlled and uncontrolled after the fact (an anti-pattern React
 * itself warns about for native inputs) isn't specially handled here
 * either.
 *
 * If neither `value` nor `defaultValue` is supplied, the returned state
 * starts as `undefined` despite the `T` return type — same accepted
 * tradeoff this pattern makes everywhere else it appears. Pass a real
 * `defaultValue` unless `T` itself includes `undefined`.
 */
export function useControllableState<T>({
  value: controlledValue,
  defaultValue,
  onChange,
}: UseControllableStateOptions<T>): [T, SetControllableState<T>] {
  const [uncontrolledValue, setUncontrolledValue] = useState<T | undefined>(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = (isControlled ? controlledValue : uncontrolledValue) as T;

  const setValue = useCallback<SetControllableState<T>>(
    (next) => {
      const resolved = typeof next === "function" ? (next as (prev: T) => T)(value) : next;
      if (!isControlled) {
        setUncontrolledValue(resolved);
      }
      onChange?.(resolved);
    },
    [isControlled, onChange, value],
  );

  return [value, setValue];
}
