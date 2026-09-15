import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useMediaQuery } from "./use-media-query";

/**
 * jsdom doesn't implement `matchMedia`, so every test installs a minimal
 * fake `MediaQueryList` that tracks its own listeners and lets the test
 * flip `matches` and fire a synthetic "change" event — enough surface for
 * `useMediaQuery`'s `addEventListener`/`removeEventListener` subscription.
 */
class FakeMediaQueryList {
  matches: boolean;
  media: string;
  private listeners = new Set<(event: { matches: boolean }) => void>();

  constructor(media: string, matches: boolean) {
    this.media = media;
    this.matches = matches;
  }

  addEventListener(_type: "change", listener: (event: { matches: boolean }) => void) {
    this.listeners.add(listener);
  }

  removeEventListener(_type: "change", listener: (event: { matches: boolean }) => void) {
    this.listeners.delete(listener);
  }

  listenerCount() {
    return this.listeners.size;
  }

  setMatches(matches: boolean) {
    this.matches = matches;
    for (const listener of this.listeners) listener({ matches });
  }
}

describe("useMediaQuery", () => {
  let registry: Map<string, FakeMediaQueryList>;

  beforeEach(() => {
    registry = new Map();
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => {
        const existing = registry.get(query);
        if (existing) return existing;
        const mql = new FakeMediaQueryList(query, false);
        registry.set(query, mql);
        return mql;
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the current match state on mount", () => {
    registry.set("(min-width: 768px)", new FakeMediaQueryList("(min-width: 768px)", true));

    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));

    expect(result.current).toBe(true);
  });

  it("defaults to false when the query doesn't match", () => {
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));

    expect(result.current).toBe(false);
  });

  it("honors a custom defaultValue when matchMedia is unavailable", () => {
    vi.stubGlobal("matchMedia", undefined);

    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)", { defaultValue: true }));

    expect(result.current).toBe(true);
  });

  it("re-renders when the media query's match state changes", () => {
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(false);

    act(() => {
      registry.get("(min-width: 768px)")?.setMatches(true);
    });

    expect(result.current).toBe(true);
  });

  it("unsubscribes from the previous query when the query string changes", () => {
    const { rerender } = renderHook(({ query }: { query: string }) => useMediaQuery(query), {
      initialProps: { query: "(min-width: 768px)" },
    });

    const first = registry.get("(min-width: 768px)");
    expect(first?.listenerCount()).toBe(1);

    rerender({ query: "(min-width: 1024px)" });

    expect(first?.listenerCount()).toBe(0);
    expect(registry.get("(min-width: 1024px)")?.listenerCount()).toBe(1);
  });

  it("removes its listener on unmount", () => {
    const { unmount } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    const mql = registry.get("(min-width: 768px)");
    expect(mql?.listenerCount()).toBe(1);

    unmount();

    expect(mql?.listenerCount()).toBe(0);
  });
});
