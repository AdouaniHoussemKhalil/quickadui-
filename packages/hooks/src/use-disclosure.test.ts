import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useDisclosure } from "./use-disclosure";

describe("useDisclosure", () => {
  it("defaults to closed", () => {
    const { result } = renderHook(() => useDisclosure());
    expect(result.current.isOpen).toBe(false);
  });

  it("honors defaultOpen", () => {
    const { result } = renderHook(() => useDisclosure({ defaultOpen: true }));
    expect(result.current.isOpen).toBe(true);
  });

  it("open() sets isOpen to true and fires onOpen", () => {
    const onOpen = vi.fn();
    const { result } = renderHook(() => useDisclosure({ onOpen }));

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("close() sets isOpen to false and fires onClose", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useDisclosure({ defaultOpen: true, onClose }));

    act(() => {
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("toggle() flips the state and fires the matching callback each time", () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const { result } = renderHook(() => useDisclosure({ onOpen, onClose }));

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(true);
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("open()/close() are idempotent about firing callbacks (called every invocation, even if already in that state)", () => {
    const onOpen = vi.fn();
    const { result } = renderHook(() => useDisclosure({ onOpen }));

    act(() => {
      result.current.open();
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);
    expect(onOpen).toHaveBeenCalledTimes(2);
  });

  it("returns referentially stable callbacks across re-renders when the options are unchanged", () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const { result, rerender } = renderHook(() => useDisclosure({ onOpen, onClose }));

    const firstOpen = result.current.open;
    const firstClose = result.current.close;
    const firstToggle = result.current.toggle;

    rerender();

    expect(result.current.open).toBe(firstOpen);
    expect(result.current.close).toBe(firstClose);
    expect(result.current.toggle).toBe(firstToggle);
  });
});
