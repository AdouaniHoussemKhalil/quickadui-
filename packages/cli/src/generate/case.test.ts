import { describe, expect, it } from "vitest";
import { toCamelCase, toKebabCase, toLabel, toNaivePlural, toPascalCase } from "./case";

describe("toPascalCase", () => {
  it("leaves an already-Pascal name alone", () => {
    expect(toPascalCase("Product")).toBe("Product");
  });

  it("joins space/underscore/hyphen-separated words", () => {
    expect(toPascalCase("product name")).toBe("ProductName");
    expect(toPascalCase("product_name")).toBe("ProductName");
    expect(toPascalCase("product-name")).toBe("ProductName");
  });
});

describe("toCamelCase", () => {
  it("lowercases just the first letter", () => {
    expect(toCamelCase("Product")).toBe("product");
    expect(toCamelCase("product_name")).toBe("productName");
  });
});

describe("toKebabCase", () => {
  it("splits camelCase/PascalCase boundaries with a hyphen", () => {
    expect(toKebabCase("ProductName")).toBe("product-name");
    expect(toKebabCase("productName")).toBe("product-name");
  });

  it("normalizes existing separators", () => {
    expect(toKebabCase("product_name")).toBe("product-name");
    expect(toKebabCase("Product")).toBe("product");
  });
});

describe("toLabel", () => {
  it("turns a camelCase field name into a sentence-case label", () => {
    expect(toLabel("inStock")).toBe("In stock");
    expect(toLabel("title")).toBe("Title");
    expect(toLabel("product_category")).toBe("Product category");
  });
});

describe("toNaivePlural", () => {
  it("adds a plain s in the common case", () => {
    expect(toNaivePlural("product")).toBe("products");
  });

  it("adds es after s/x/z/ch/sh", () => {
    expect(toNaivePlural("box")).toBe("boxes");
    expect(toNaivePlural("wish")).toBe("wishes");
  });

  it("turns a trailing consonant+y into ies", () => {
    expect(toNaivePlural("category")).toBe("categories");
  });
});
