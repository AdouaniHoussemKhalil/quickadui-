import { describe, expect, it } from "vitest";
import { renderSourceDirective } from "./source-directive";

describe("renderSourceDirective", () => {
  it("points at the package inside node_modules", () => {
    expect(renderSourceDirective("@quickadui/core")).toBe('@source "./node_modules/@quickadui/core";');
  });
});
