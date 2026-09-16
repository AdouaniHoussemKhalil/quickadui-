import { describe, expect, it } from "vitest";
import { paginationLinkVariants } from "./pagination";

describe("paginationLinkVariants", () => {
  it("defaults to state=default", () => {
    const withDefaults = paginationLinkVariants();
    const explicit = paginationLinkVariants({ state: "default" });
    expect(withDefaults).toBe(explicit);
  });

  it("always includes the base size/shape classes", () => {
    expect(paginationLinkVariants()).toContain("size-9");
    expect(paginationLinkVariants()).toContain("rounded-md");
  });

  it("state=active includes the solid accent background", () => {
    expect(paginationLinkVariants({ state: "active" })).toContain("bg-accent-9");
  });

  it("state=default does not include the active background", () => {
    expect(paginationLinkVariants({ state: "default" })).not.toContain("bg-accent-9");
  });
});
