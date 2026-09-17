import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDebouncedValue } from "./use-debounced-value";

describe("useDebouncedValue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the initial value immediately, with no delay", () => {
    const { result } = renderHook(() => useDebouncedValue("a", 200));
    expect(result.current).toBe("a");
  });

  it("does not update before delayMs has elapsed", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 200),
      {
        initialProps: { value: "a" },
      },
    );

    rerender({ value: "b" });
    act(() => {
      vi.advanceTimersByTime(199);
    });

    expect(result.current).toBe("a");
  });

  it("updates to the latest value once delayMs has elapsed", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 200),
      {
        initialProps: { value: "a" },
      },
    );

    rerender({ value: "b" });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe("b");
  });

  it("resets the timer on every intermediate change, only committing the final value", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 200),
      {
        initialProps: { value: "a" },
      },
    );

    rerender({ value: "b" });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    rerender({ value: "c" });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    rerender({ value: "d" });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Each rerender restarted the 200ms window, so nothing has committed yet.
    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe("d");
  });

  it("clears the pending timer on unmount without throwing", () => {
    const { rerender, unmount } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 200),
      {
        initialProps: { value: "a" },
      },
    );

    rerender({ value: "b" });
    expect(() => unmount()).not.toThrow();
  });
});
