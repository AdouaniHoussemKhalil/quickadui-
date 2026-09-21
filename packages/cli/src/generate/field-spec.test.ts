import { describe, expect, it } from "vitest";
import { parseFieldSpec } from "./field-spec";

describe("parseFieldSpec", () => {
  it("parses a comma-separated list of name:type pairs, in order", () => {
    const fields = parseFieldSpec("title:string,price:number,inStock:boolean");
    expect(fields).toEqual([
      { name: "title", type: "string" },
      { name: "price", type: "number" },
      { name: "inStock", type: "boolean" },
    ]);
  });

  it("tolerates surrounding whitespace", () => {
    const fields = parseFieldSpec(" title : string , price : number ");
    expect(fields).toEqual([
      { name: "title", type: "string" },
      { name: "price", type: "number" },
    ]);
  });

  it("skips empty entries from trailing/doubled commas", () => {
    const fields = parseFieldSpec("title:string,,price:number,");
    expect(fields).toEqual([
      { name: "title", type: "string" },
      { name: "price", type: "number" },
    ]);
  });

  it("throws on an empty spec", () => {
    expect(() => parseFieldSpec("")).toThrow(/required/);
  });

  it("throws on a missing colon", () => {
    expect(() => parseFieldSpec("title")).toThrow(/Expected "name:type"/);
  });

  it("throws on an unknown type", () => {
    expect(() => parseFieldSpec("createdAt:date")).toThrow(/Unknown field type "date"/);
  });

  it("throws on a duplicate field name", () => {
    expect(() => parseFieldSpec("title:string,title:number")).toThrow(/Duplicate field name/);
  });

  it("throws on a field name that isn't a valid JS identifier", () => {
    expect(() => parseFieldSpec("2fast:string")).toThrow(/Invalid field name/);
    expect(() => parseFieldSpec("first-name:string")).toThrow(/Invalid field name/);
  });

  it("accepts underscores and dollar signs in a field name", () => {
    const fields = parseFieldSpec("_id:number,$special:string");
    expect(fields).toEqual([
      { name: "_id", type: "number" },
      { name: "$special", type: "string" },
    ]);
  });
});
