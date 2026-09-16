import { describe, expect, it } from "vitest";
import { CHART_SERIES_VARS, getSeriesColor } from "./palette";

describe("getSeriesColor", () => {
  it("returns the Nth categorical slot in order", () => {
    expect(getSeriesColor(0)).toBe(CHART_SERIES_VARS[0]);
    expect(getSeriesColor(3)).toBe(CHART_SERIES_VARS[3]);
  });

  it("repeats the last slot past the 8th series instead of inventing a new hue", () => {
    const last = CHART_SERIES_VARS[CHART_SERIES_VARS.length - 1];
    expect(getSeriesColor(8)).toBe(last);
    expect(getSeriesColor(50)).toBe(last);
  });
});
