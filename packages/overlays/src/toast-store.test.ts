import { afterEach, describe, expect, it, vi } from "vitest";
import {
  _resetToastStoreForTests,
  dismissToast,
  getSnapshot,
  subscribe,
  toast,
} from "./toast-store";

afterEach(() => {
  _resetToastStoreForTests();
});

describe("toast-store", () => {
  it("starts empty", () => {
    expect(getSnapshot()).toEqual([]);
  });

  it("toast() appends a toast and returns its id", () => {
    const id = toast({ title: "Saved" });
    expect(getSnapshot()).toHaveLength(1);
    expect(getSnapshot()[0]).toMatchObject({ id, title: "Saved" });
  });

  it("toast() preserves insertion order across multiple calls", () => {
    const firstId = toast({ title: "First" });
    const secondId = toast({ title: "Second" });
    expect(getSnapshot().map((t) => t.id)).toEqual([firstId, secondId]);
  });

  it("dismissToast() removes only the matching toast", () => {
    const firstId = toast({ title: "First" });
    const secondId = toast({ title: "Second" });
    dismissToast(firstId);
    expect(getSnapshot().map((t) => t.id)).toEqual([secondId]);
  });

  it("getSnapshot() returns a stable reference until the store changes (required for useSyncExternalStore)", () => {
    toast({ title: "Saved" });
    expect(getSnapshot()).toBe(getSnapshot());
  });

  it("getSnapshot() returns a new reference after a mutation", () => {
    const before = getSnapshot();
    toast({ title: "Saved" });
    expect(getSnapshot()).not.toBe(before);
  });

  it("subscribe() notifies listeners on toast() and dismissToast()", () => {
    const listener = vi.fn();
    subscribe(listener);

    const id = toast({ title: "Saved" });
    expect(listener).toHaveBeenCalledTimes(1);

    dismissToast(id);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("subscribe()'s returned function unsubscribes", () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);
    unsubscribe();

    toast({ title: "Saved" });
    expect(listener).not.toHaveBeenCalled();
  });
});
