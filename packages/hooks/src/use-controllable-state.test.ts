import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useControllableState } from "./use-controllable-state";

describe("useControllableState", () => {
  describe("uncontrolled mode", () => {
    it("starts at defaultValue", () => {
      const { result } = renderHook(() => useControllableState<string>({ defaultValue: "a" }));
      expect(result.current[0]).toBe("a");
    });

    it("updates its own state when setValue is called with a plain value", () => {
      const { result } = renderHook(() => useControllableState<string>({ defaultValue: "a" }));

      act(() => {
        result.current[1]("b");
      });

      expect(result.current[0]).toBe("b");
    });

    it("updates its own state when setValue is called with an updater function", () => {
      const { result } = renderHook(() => useControllableState<number>({ defaultValue: 1 }));

      act(() => {
        result.current[1]((prev) => prev + 1);
      });

      expect(result.current[0]).toBe(2);
    });

    it("calls onChange with the resolved value", () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useControllableState<number>({ defaultValue: 1, onChange }));

      act(() => {
        result.current[1]((prev) => prev + 1);
      });

      expect(onChange).toHaveBeenCalledWith(2);
    });
  });

  describe("controlled mode", () => {
    it("reflects the caller's value, ignoring defaultValue", () => {
      const { result } = renderHook(() => useControllableState<string>({ value: "controlled", defaultValue: "uncontrolled" }));
      expect(result.current[0]).toBe("controlled");
    });

    it("does not change its own return value on setValue — it only calls onChange", () => {
      const onChange = vi.fn();
      const { result, rerender } = renderHook(({ value }: { value: string }) => useControllableState<string>({ value, onChange }), {
        initialProps: { value: "controlled" },
      });

      act(() => {
        result.current[1]("attempted-change");
      });

      // The caller hasn't fed the new value back in via `value`, so the hook
      // still reports the original controlled value.
      expect(result.current[0]).toBe("controlled");
      expect(onChange).toHaveBeenCalledWith("attempted-change");

      // Once the caller re-renders with the updated value, it's reflected.
      rerender({ value: "attempted-change" });
      expect(result.current[0]).toBe("attempted-change");
    });

    it("resolves an updater function against the current controlled value", () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useControllableState<number>({ value: 5, onChange }));

      act(() => {
        result.current[1]((prev) => prev + 10);
      });

      expect(onChange).toHaveBeenCalledWith(15);
    });
  });

  it("returns a referentially stable setValue when isControlled/onChange/value are unchanged", () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(() => useControllableState<number>({ defaultValue: 1, onChange }));

    const firstSetValue = result.current[1];

    rerender();

    // `value` is part of setValue's closure (used to resolve updater
    // functions), so identity is only stable while the value itself hasn't
    // changed between renders.
    expect(result.current[1]).toBe(firstSetValue);
  });
});
