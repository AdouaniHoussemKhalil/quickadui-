import { describe, expect, it } from "vitest";
import { buildAreaPath, buildDonutSegments, buildLinePath, describeDonutSegment, linearScale, niceTicks, polarToCartesian } from "./chart-math";

describe("linearScale", () => {
  it("maps a value proportionally into the target range", () => {
    expect(linearScale(5, 0, 10, 0, 100)).toBe(50);
    expect(linearScale(0, 0, 10, 0, 100)).toBe(0);
    expect(linearScale(10, 0, 10, 0, 100)).toBe(100);
  });

  it("supports an inverted range (e.g. SVG y grows downward)", () => {
    expect(linearScale(0, 0, 10, 100, 0)).toBe(100);
    expect(linearScale(10, 0, 10, 100, 0)).toBe(0);
  });

  it("falls back to the range midpoint for a zero-width domain instead of dividing by zero", () => {
    expect(linearScale(5, 5, 5, 0, 100)).toBe(50);
  });
});

describe("niceTicks", () => {
  it("returns round numbers spanning the domain", () => {
    const ticks = niceTicks(0, 97, 5);
    expect(ticks[0]).toBeLessThanOrEqual(0);
    expect(ticks.at(-1)).toBeGreaterThanOrEqual(97);
    for (const tick of ticks) {
      expect(Number.isFinite(tick)).toBe(true);
    }
  });

  it("picks a step from the 1/2/5 family, not an arbitrary fraction", () => {
    const ticks = niceTicks(0, 1000, 5);
    const step = (ticks[1] as number) - (ticks[0] as number);
    const magnitude = 10 ** Math.floor(Math.log10(step));
    const normalized = Math.round((step / magnitude) * 100) / 100;
    expect([1, 2, 5, 10]).toContain(normalized);
  });

  it("handles a degenerate zero-span domain without dividing by zero", () => {
    expect(niceTicks(0, 0)).toEqual([0]);
  });
});

describe("buildLinePath", () => {
  it("returns an empty string for fewer than 2 points", () => {
    expect(buildLinePath([])).toBe("");
    expect(buildLinePath([{ x: 0, y: 0 }])).toBe("");
  });

  it("starts with M and connects the rest with L", () => {
    const d = buildLinePath([
      { x: 0, y: 10 },
      { x: 5, y: 0 },
      { x: 10, y: 8 },
    ]);
    expect(d).toBe("M 0 10 L 5 0 L 10 8");
  });
});

describe("buildAreaPath", () => {
  it("closes the line path down to the baseline and back to the start", () => {
    const d = buildAreaPath(
      [
        { x: 0, y: 10 },
        { x: 10, y: 0 },
      ],
      20,
    );
    expect(d).toBe("M 0 10 L 10 0 L 10 20 L 0 20 Z");
  });

  it("returns an empty string for fewer than 2 points", () => {
    expect(buildAreaPath([{ x: 0, y: 0 }], 10)).toBe("");
  });
});

describe("buildDonutSegments", () => {
  it("splits proportionally into 360 degrees total span (ignoring gaps)", () => {
    const segments = buildDonutSegments([1, 1, 2], 0);
    expect(segments.map((s) => s.fraction)).toEqual([0.25, 0.25, 0.5]);
    expect(segments[0]?.startAngle).toBe(0);
    expect(segments[0]?.endAngle).toBe(90);
    expect(segments[1]?.startAngle).toBe(90);
    expect(segments[1]?.endAngle).toBe(180);
    expect(segments[2]?.endAngle).toBe(360);
  });

  it("applies a symmetric gap between segments when there's more than one", () => {
    const segments = buildDonutSegments([1, 1], 4);
    expect(segments[0]?.startAngle).toBe(2);
    expect(segments[0]?.endAngle).toBe(178);
    expect(segments[1]?.startAngle).toBe(182);
  });

  it("applies no gap for a single segment", () => {
    const segments = buildDonutSegments([1], 4);
    expect(segments[0]?.startAngle).toBe(0);
    expect(segments[0]?.endAngle).toBe(360);
  });

  it("returns zero-fraction segments instead of NaN when every value is zero", () => {
    const segments = buildDonutSegments([0, 0], 4);
    expect(segments).toEqual([
      { fraction: 0, startAngle: 0, endAngle: 0 },
      { fraction: 0, startAngle: 0, endAngle: 0 },
    ]);
  });
});

describe("polarToCartesian", () => {
  it("places 0 degrees at 12 o'clock (straight up from center)", () => {
    const p = polarToCartesian(50, 50, 10, 0);
    expect(p.x).toBeCloseTo(50);
    expect(p.y).toBeCloseTo(40);
  });

  it("places 90 degrees at 3 o'clock (right of center)", () => {
    const p = polarToCartesian(50, 50, 10, 90);
    expect(p.x).toBeCloseTo(60);
    expect(p.y).toBeCloseTo(50);
  });
});

describe("describeDonutSegment", () => {
  it("returns an empty string for a zero-or-negative span", () => {
    expect(describeDonutSegment(50, 50, 20, 40, 10, 10)).toBe("");
    expect(describeDonutSegment(50, 50, 20, 40, 20, 10)).toBe("");
  });

  it("returns a non-empty path for a real ring segment", () => {
    const d = describeDonutSegment(50, 50, 20, 40, 0, 90);
    expect(d.length).toBeGreaterThan(0);
    expect(d.startsWith("M")).toBe(true);
  });

  it("returns a pie-slice path (starting at the center) when innerRadius is 0", () => {
    const d = describeDonutSegment(50, 50, 0, 40, 0, 90);
    expect(d.startsWith("M 50 50")).toBe(true);
  });
});
