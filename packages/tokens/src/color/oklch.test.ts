import { describe, expect, it } from "vitest";
import { hexToOklch, oklchToHex } from "./oklch";

describe("hexToOklch / oklchToHex", () => {
  const cases = ["#C85A1B", "#0E7C7B", "#171A21", "#1A7F5A", "#9A6B0C", "#B23A2B", "#FFFFFF", "#000000"];

  it.each(cases)("round-trips %s exactly", (hex) => {
    expect(oklchToHex(hexToOklch(hex))).toBe(hex);
  });

  it("decomposes into a lightness between 0 and 1", () => {
    for (const hex of cases) {
      const { L } = hexToOklch(hex);
      expect(L).toBeGreaterThanOrEqual(0);
      expect(L).toBeLessThanOrEqual(1);
    }
  });

  it("gives white L close to 1 and black L close to 0", () => {
    expect(hexToOklch("#FFFFFF").L).toBeGreaterThan(0.99);
    expect(hexToOklch("#000000").L).toBeLessThan(0.01);
  });
});
