import { describe, expect, it } from "vitest";
import { drawerContentVariants } from "./drawer";

describe("drawerContentVariants", () => {
  it("defaults to side=right", () => {
    const withDefaults = drawerContentVariants();
    const explicit = drawerContentVariants({ side: "right" });
    expect(withDefaults).toBe(explicit);
  });

  it("always includes the base positioning/surface classes", () => {
    expect(drawerContentVariants()).toContain("fixed");
    expect(drawerContentVariants()).toContain("bg-neutral-1");
  });

  it.each([
    ["top", "inset-x-0"],
    ["bottom", "inset-x-0"],
    ["left", "inset-y-0"],
    ["right", "inset-y-0"],
  ] as const)("side=%s includes %s", (side, expectedClass) => {
    expect(drawerContentVariants({ side })).toContain(expectedClass);
  });

  it.each([
    ["left", "border-r"],
    ["right", "border-l"],
    ["top", "border-b"],
    ["bottom", "border-t"],
  ] as const)(
    "side=%s puts the border on the edge opposite the anchor (%s)",
    (side, expectedClass) => {
      expect(drawerContentVariants({ side })).toContain(expectedClass);
    },
  );
});
