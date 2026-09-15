import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect";

describe("useIsomorphicLayoutEffect", () => {
  it("runs the effect synchronously before paint, like useLayoutEffect, in a DOM environment", () => {
    const calls: string[] = [];

    renderHook(() => {
      useIsomorphicLayoutEffect(() => {
        calls.push("effect");
        return () => {
          calls.push("cleanup");
        };
      }, []);
    });

    expect(calls).toEqual(["effect"]);
  });

  it("re-runs when a dependency changes and cleans up the previous effect first", () => {
    const calls: string[] = [];

    const { rerender } = renderHook(
      ({ dep }: { dep: number }) => {
        useIsomorphicLayoutEffect(() => {
          calls.push(`effect:${dep}`);
          return () => {
            calls.push(`cleanup:${dep}`);
          };
        }, [dep]);
      },
      { initialProps: { dep: 1 } },
    );

    rerender({ dep: 2 });

    expect(calls).toEqual(["effect:1", "cleanup:1", "effect:2"]);
  });

  it("cleans up on unmount", () => {
    const calls: string[] = [];

    const { unmount } = renderHook(() => {
      useIsomorphicLayoutEffect(() => {
        calls.push("effect");
        return () => {
          calls.push("cleanup");
        };
      }, []);
    });

    unmount();

    expect(calls).toEqual(["effect", "cleanup"]);
  });
});
