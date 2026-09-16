import { describe, expect, it } from "vitest";
import { tableRowVariants } from "./table";

describe("tableRowVariants", () => {
  it("defaults to state=default", () => {
    const withDefaults = tableRowVariants();
    const explicit = tableRowVariants({ state: "default" });
    expect(withDefaults).toBe(explicit);
  });

  it("always includes the base border/hover classes", () => {
    expect(tableRowVariants()).toContain("border-b");
    expect(tableRowVariants()).toContain("hover:bg-neutral-2");
  });

  it("state=selected includes the accent background", () => {
    expect(tableRowVariants({ state: "selected" })).toContain("bg-accent-3");
  });

  it("state=default adds no extra background class", () => {
    expect(tableRowVariants({ state: "default" })).not.toContain("bg-accent-3");
  });
});
