import { describe, expect, it } from "vitest";
import { flexVariants } from "./flex";

describe("flexVariants", () => {
  it("defaults to row/stretch/start/nowrap/no gap", () => {
    const withDefaults = flexVariants();
    const explicit = flexVariants({ direction: "row", align: "stretch", justify: "start", wrap: "nowrap", gap: "none" });
    expect(withDefaults).toBe(explicit);
  });

  it("always includes the base flex class", () => {
    expect(flexVariants()).toContain("flex");
  });

  it.each([
    ["row", "flex-row"],
    ["column", "flex-col"],
    ["row-reverse", "flex-row-reverse"],
    ["column-reverse", "flex-col-reverse"],
  ] as const)("direction=%s includes %s", (direction, expectedClass) => {
    expect(flexVariants({ direction })).toContain(expectedClass);
  });

  it.each([
    ["start", "items-start"],
    ["center", "items-center"],
    ["end", "items-end"],
    ["stretch", "items-stretch"],
    ["baseline", "items-baseline"],
  ] as const)("align=%s includes %s", (align, expectedClass) => {
    expect(flexVariants({ align })).toContain(expectedClass);
  });

  it.each([
    ["start", "justify-start"],
    ["center", "justify-center"],
    ["end", "justify-end"],
    ["between", "justify-between"],
    ["around", "justify-around"],
    ["evenly", "justify-evenly"],
  ] as const)("justify=%s includes %s", (justify, expectedClass) => {
    expect(flexVariants({ justify })).toContain(expectedClass);
  });

  it.each([
    ["nowrap", "flex-nowrap"],
    ["wrap", "flex-wrap"],
    ["wrap-reverse", "flex-wrap-reverse"],
  ] as const)("wrap=%s includes %s", (wrap, expectedClass) => {
    expect(flexVariants({ wrap })).toContain(expectedClass);
  });

  it.each([
    ["none", "gap-0"],
    ["xs", "gap-1"],
    ["sm", "gap-2"],
    ["md", "gap-4"],
    ["lg", "gap-6"],
    ["xl", "gap-8"],
    ["2xl", "gap-12"],
  ] as const)("gap=%s includes %s", (gap, expectedClass) => {
    expect(flexVariants({ gap })).toContain(expectedClass);
  });
});
