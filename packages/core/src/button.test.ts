import { describe, expect, it } from "vitest";
import { Button, buttonVariants, resolveButtonDisabled, resolveButtonIcon } from "./button";
import { Spinner } from "./spinner";

describe("buttonVariants", () => {
  it("defaults to solid/md", () => {
    const withDefaults = buttonVariants();
    const explicit = buttonVariants({ variant: "solid", size: "md" });
    expect(withDefaults).toBe(explicit);
  });

  it("includes the base layout classes regardless of variant", () => {
    expect(buttonVariants()).toContain("inline-flex");
    expect(buttonVariants()).toContain("rounded-md");
  });

  it.each([
    ["solid", "bg-accent-9"],
    ["soft", "bg-accent-3"],
    ["outline", "border-accent-7"],
    ["ghost", "bg-transparent"],
    ["destructive", "bg-danger-9"],
  ] as const)("variant=%s includes %s", (variant, expectedClass) => {
    expect(buttonVariants({ variant })).toContain(expectedClass);
  });

  it.each([
    ["sm", "h-8"],
    ["md", "h-10"],
    ["lg", "h-12"],
  ] as const)("size=%s includes %s", (size, expectedClass) => {
    expect(buttonVariants({ size })).toContain(expectedClass);
  });
});

describe("resolveButtonDisabled", () => {
  it("is false when neither isLoading nor disabled is set", () => {
    expect(resolveButtonDisabled(undefined, undefined)).toBe(false);
  });

  it("is true while isLoading, even if disabled was explicitly false", () => {
    // A caller can't usefully click a button whose own action is already
    // in flight — isLoading always wins.
    expect(resolveButtonDisabled(true, false)).toBe(true);
  });

  it("is true when explicitly disabled, independent of isLoading", () => {
    expect(resolveButtonDisabled(false, true)).toBe(true);
    expect(resolveButtonDisabled(undefined, true)).toBe(true);
  });

  it("is true when both are set", () => {
    expect(resolveButtonDisabled(true, true)).toBe(true);
  });
});

describe("resolveButtonIcon", () => {
  it("returns the icon unchanged when not loading", () => {
    const icon = "ICON_MARKER";
    expect(resolveButtonIcon(icon, false)).toBe(icon);
    expect(resolveButtonIcon(icon, undefined)).toBe(icon);
  });

  it("returns undefined when there's no icon and not loading", () => {
    expect(resolveButtonIcon(undefined, false)).toBeUndefined();
  });

  it("returns a Spinner while loading, replacing whatever icon was passed", () => {
    // "Loading wins" — same rule resolveButtonDisabled enforces for
    // `disabled` — so a button never shows both a spinner and an icon.
    const withIcon = resolveButtonIcon("ICON_MARKER", true) as { type: unknown };
    const withoutIcon = resolveButtonIcon(undefined, true) as { type: unknown };
    expect(withIcon.type).toBe(Spinner);
    expect(withoutIcon.type).toBe(Spinner);
  });
});

describe("Button icon rendering", () => {
  it("renders the icon before children by default (iconPosition left)", () => {
    const icon = "ICON_MARKER";
    const element = Button({ icon, children: "Save" } as never) as {
      props: { children: readonly unknown[] };
    };
    const [before, children, after] = element.props.children;
    expect(before).toBe(icon);
    expect(children).toBe("Save");
    expect(after).toBe(false);
  });

  it("renders the icon after children when iconPosition is right", () => {
    const icon = "ICON_MARKER";
    const element = Button({ icon, iconPosition: "right", children: "Save" } as never) as {
      props: { children: readonly unknown[] };
    };
    const [before, children, after] = element.props.children;
    expect(before).toBe(false);
    expect(children).toBe("Save");
    expect(after).toBe(icon);
  });

  it("shows the Spinner in the icon's slot while isLoading, not the icon itself", () => {
    const icon = "ICON_MARKER";
    const element = Button({ icon, isLoading: true, children: "Save" } as never) as {
      props: { children: readonly unknown[] };
    };
    const [before] = element.props.children as [{ type: unknown }, unknown, unknown];
    expect(before.type).toBe(Spinner);
  });

  it("renders neither slot when there's no icon and no isLoading", () => {
    const element = Button({ children: "Save" } as never) as {
      props: { children: readonly unknown[] };
    };
    const [before, children, after] = element.props.children;
    // `iconPosition === "left" && undefined` evaluates to `undefined`
    // (not `false`) when the icon slot itself is empty — either way
    // React renders nothing, but the test should assert what the code
    // actually produces, not a value that merely looks equivalent.
    expect(before).toBeUndefined();
    expect(children).toBe("Save");
    expect(after).toBe(false);
  });
});
