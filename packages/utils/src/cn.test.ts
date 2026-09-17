import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("joins plain string arguments", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("drops falsy values (booleans, null, undefined)", () => {
    expect(cn("px-2", false, null, undefined, "py-1")).toBe("px-2 py-1");
  });

  it("resolves conditional classes via clsx's object syntax", () => {
    expect(cn({ "bg-accent-9": true, "bg-gray-3": false })).toBe("bg-accent-9");
  });

  it("flattens arrays of classes", () => {
    expect(cn(["px-2", "py-1"], "text-sm")).toBe("px-2 py-1 text-sm");
  });

  it("resolves a genuine Tailwind conflict by keeping the last class (same property)", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("lets a later className override an earlier default of the same utility group", () => {
    // The canonical `cn(defaultClasses, props.className)` pattern: a
    // caller-supplied override should win over the component's own default.
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("keeps non-conflicting classes from both sides", () => {
    expect(cn("px-2 py-1 rounded-md", "text-sm")).toBe("px-2 py-1 rounded-md text-sm");
  });

  it("returns an empty string when nothing resolves to a class", () => {
    expect(cn(false, null, undefined, "")).toBe("");
  });

  it("handles a real component-style call: defaults + conditional + override", () => {
    const isDisabled = true;
    const className = "px-8";
    expect(
      cn("px-2 py-1 rounded-md", isDisabled && "opacity-50 pointer-events-none", className),
    ).toBe("py-1 rounded-md opacity-50 pointer-events-none px-8");
  });
});
