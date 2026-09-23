import { describe, expect, it } from "vitest";
import type { DiscoveredFeature } from "./discover-features";
import { defaultNavItems, formatNavItemsSpec, parseNavItemsSpec } from "./nav-items";

describe("parseNavItemsSpec", () => {
  it("parses a simple Label:href list", () => {
    expect(parseNavItemsSpec("Home:#/,Products:#/products")).toEqual([
      { label: "Home", href: "#/" },
      { label: "Products", href: "#/products" },
    ]);
  });

  it("trims whitespace around labels and hrefs", () => {
    expect(parseNavItemsSpec(" Home : #/ , Products : #/products ")).toEqual([
      { label: "Home", href: "#/" },
      { label: "Products", href: "#/products" },
    ]);
  });

  it("guesses a hash href for an entry with no ':'", () => {
    expect(parseNavItemsSpec("Docs")).toEqual([{ label: "Docs", href: "#/docs" }]);
  });

  it("lowercases and dashes a multi-word guessed href", () => {
    expect(parseNavItemsSpec("Release Notes")).toEqual([
      { label: "Release Notes", href: "#/release-notes" },
    ]);
  });

  it("skips blank entries from trailing/doubled commas", () => {
    expect(parseNavItemsSpec("Home:#/,,Products:#/products,")).toEqual([
      { label: "Home", href: "#/" },
      { label: "Products", href: "#/products" },
    ]);
  });

  it("returns [] for an empty or all-whitespace spec", () => {
    expect(parseNavItemsSpec("")).toEqual([]);
    expect(parseNavItemsSpec("   ")).toEqual([]);
  });

  it("parses an optional third ':'-separated segment as an icon name", () => {
    expect(parseNavItemsSpec("Home:#/:Home,Products:#/products:Package")).toEqual([
      { label: "Home", href: "#/", icon: "Home" },
      { label: "Products", href: "#/products", icon: "Package" },
    ]);
  });

  it("trims whitespace around an icon segment", () => {
    expect(parseNavItemsSpec(" Home : #/ : Home ")).toEqual([
      { label: "Home", href: "#/", icon: "Home" },
    ]);
  });

  it("treats a trailing empty icon segment the same as omitting it", () => {
    expect(parseNavItemsSpec("Home:#/:")).toEqual([{ label: "Home", href: "#/" }]);
  });

  it("mixes items with and without an icon in the same spec", () => {
    expect(parseNavItemsSpec("Home:#/:Home,Products:#/products")).toEqual([
      { label: "Home", href: "#/", icon: "Home" },
      { label: "Products", href: "#/products" },
    ]);
  });
});

describe("formatNavItemsSpec", () => {
  it("is the inverse of parseNavItemsSpec for a well-formed list without icons", () => {
    const items = [
      { label: "Home", href: "#/" },
      { label: "Products", href: "#/products" },
    ];
    expect(parseNavItemsSpec(formatNavItemsSpec(items))).toEqual(items);
  });

  it("is the inverse of parseNavItemsSpec for a list with icons", () => {
    const items = [
      { label: "Home", href: "#/", icon: "Home" },
      { label: "Products", href: "#/products" },
    ];
    expect(parseNavItemsSpec(formatNavItemsSpec(items))).toEqual(items);
  });
});

describe("defaultNavItems", () => {
  it("turns a resource feature into a Label/#/endpoint item", () => {
    const features: readonly DiscoveredFeature[] = [
      {
        kind: "resource",
        pascal: "Product",
        camel: "product",
        kebab: "product",
        endpoint: "products",
        label: "Products",
      },
    ];
    expect(defaultNavItems(features)).toEqual([{ label: "Products", href: "#/products" }]);
  });

  it("passes an auth feature's own label/href straight through", () => {
    const features: readonly DiscoveredFeature[] = [
      { kind: "login", label: "Login", href: "#/login" },
    ];
    expect(defaultNavItems(features)).toEqual([{ label: "Login", href: "#/login" }]);
  });

  it("preserves feature order", () => {
    const features: readonly DiscoveredFeature[] = [
      {
        kind: "resource",
        pascal: "Product",
        camel: "product",
        kebab: "product",
        endpoint: "products",
        label: "Products",
      },
      { kind: "login", label: "Login", href: "#/login" },
      { kind: "profile", label: "Profile", href: "#/profile" },
    ];
    expect(defaultNavItems(features).map((item) => item.label)).toEqual([
      "Products",
      "Login",
      "Profile",
    ]);
  });
});
