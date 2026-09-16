import { describe, expect, it } from "vitest";
import { sidebarNavItemVariants } from "./sidebar";

describe("sidebarNavItemVariants", () => {
  it("defaults to the default state", () => {
    expect(sidebarNavItemVariants()).toBe(sidebarNavItemVariants({ state: "default" }));
  });

  it("includes the base layout classes regardless of state", () => {
    expect(sidebarNavItemVariants({ state: "active" })).toContain("flex");
    expect(sidebarNavItemVariants({ state: "active" })).toContain("items-center");
  });

  it("applies the active state's accent classes", () => {
    const classes = sidebarNavItemVariants({ state: "active" });
    expect(classes).toContain("bg-accent-3");
    expect(classes).toContain("text-accent-11");
  });

  it("applies the default state's neutral text class, not the active one", () => {
    const classes = sidebarNavItemVariants({ state: "default" });
    expect(classes).toContain("text-neutral-11");
    expect(classes).not.toContain("bg-accent-3");
  });
});
