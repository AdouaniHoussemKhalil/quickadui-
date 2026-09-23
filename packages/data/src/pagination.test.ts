import { ChevronLeftIcon, ChevronRightIcon } from "@quickadui/icons";
import { describe, expect, it } from "vitest";
import { PaginationNext, PaginationPrevious, paginationLinkVariants } from "./pagination";

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

describe("PaginationPrevious", () => {
  it("renders only a ChevronLeftIcon, no 'Previous' text", () => {
    const element = PaginationPrevious({}) as {
      props: { children: unknown; className: string; "aria-label": string };
    };
    const icon = element.props.children as { type: unknown };
    // Compared by direct function reference, not a `.iconName` static —
    // the icon components (@quickadui/icons) are plain function
    // components with no such metadata attached; the reference itself is
    // both the simplest and the most robust check (unaffected by any
    // future minification of `.name`, unlike a string comparison would be).
    expect(icon.type).toBe(ChevronLeftIcon);
    // The whole point of this fix: no hardcoded English word as a
    // *visible* child — only the icon element is rendered.
    expect(typeof element.props.children).not.toBe("string");
  });

  it("keeps a spacing margin so it doesn't sit glued to the first page link", () => {
    const element = PaginationPrevious({}) as { props: { className: string } };
    expect(element.props.className).toContain("mr-1");
  });

  it("still carries an aria-label for assistive tech, overridable by the caller", () => {
    const defaultLabel = PaginationPrevious({}) as { props: { "aria-label": string } };
    expect(defaultLabel.props["aria-label"]).toBe("Go to previous page");

    const overridden = PaginationPrevious({ "aria-label": "Page précédente" } as never) as {
      props: { "aria-label": string };
    };
    expect(overridden.props["aria-label"]).toBe("Page précédente");
  });
});

describe("PaginationNext", () => {
  it("renders only a ChevronRightIcon, no 'Next' text", () => {
    const element = PaginationNext({}) as {
      props: { children: unknown; className: string };
    };
    const icon = element.props.children as { type: unknown };
    expect(icon.type).toBe(ChevronRightIcon);
    expect(typeof element.props.children).not.toBe("string");
  });

  it("keeps a spacing margin so it doesn't sit glued to the last page link", () => {
    const element = PaginationNext({}) as { props: { className: string } };
    expect(element.props.className).toContain("ml-1");
  });
});
