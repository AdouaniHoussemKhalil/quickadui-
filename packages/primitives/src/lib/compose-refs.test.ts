import { describe, expect, it } from "vitest";
import { composeRefs, type RefObject } from "./compose-refs";

describe("composeRefs", () => {
  it("sets every object ref's .current to the node", () => {
    const a: RefObject<string> = { current: null };
    const b: RefObject<string> = { current: null };
    const composed = composeRefs(a, b);
    composed("node-1");
    expect(a.current).toBe("node-1");
    expect(b.current).toBe("node-1");
  });

  it("calls every callback ref with the node", () => {
    const seen: string[] = [];
    const composed = composeRefs<string>(
      (node) => {
        seen.push(`first:${node}`);
      },
      (node) => {
        seen.push(`second:${node}`);
      },
    );
    composed("node-1");
    expect(seen).toEqual(["first:node-1", "second:node-1"]);
  });

  it("mixes callback and object refs", () => {
    const obj: RefObject<string> = { current: null };
    let callbackSaw: string | null = null;
    const composed = composeRefs<string>(obj, (node) => {
      callbackSaw = node;
    });
    composed("node-1");
    expect(obj.current).toBe("node-1");
    expect(callbackSaw).toBe("node-1");
  });

  it("skips null and undefined refs without throwing", () => {
    const obj: RefObject<string> = { current: null };
    expect(() => composeRefs<string>(obj, null, undefined)("node-1")).not.toThrow();
    expect(obj.current).toBe("node-1");
  });

  it("propagates null (unmount) to every ref", () => {
    const obj: RefObject<string> = { current: "stale" };
    let callbackSaw: string | null = "stale";
    const composed = composeRefs<string>(obj, (node) => {
      callbackSaw = node;
    });
    composed(null);
    expect(obj.current).toBeNull();
    expect(callbackSaw).toBeNull();
  });

  it("runs every returned cleanup function when the composed ref is called with null", () => {
    const cleaned: string[] = [];
    const composed = composeRefs<string>(
      () => () => {
        cleaned.push("first");
      },
      () => () => {
        cleaned.push("second");
      },
    );
    const cleanup = composed("node-1");
    expect(typeof cleanup).toBe("function");
    cleanup?.();
    expect(cleaned).toEqual(["first", "second"]);
  });

  it("returns undefined (no cleanup) when no composed ref returns one", () => {
    const composed = composeRefs<string>(() => {
      // no cleanup returned
    });
    expect(composed("node-1")).toBeUndefined();
  });

  it("composeRefs() with no refs at all is a safe no-op", () => {
    expect(() => composeRefs<string>()("node-1")).not.toThrow();
  });
});
