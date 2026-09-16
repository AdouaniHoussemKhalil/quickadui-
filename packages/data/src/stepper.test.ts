import { describe, expect, it } from "vitest";
import { getStepStatus } from "./stepper";

describe("getStepStatus", () => {
  it("marks steps before the current value as complete", () => {
    expect(getStepStatus(0, 2)).toBe("complete");
    expect(getStepStatus(1, 2)).toBe("complete");
  });

  it("marks the step matching the current value as active", () => {
    expect(getStepStatus(2, 2)).toBe("active");
  });

  it("marks steps after the current value as upcoming", () => {
    expect(getStepStatus(3, 2)).toBe("upcoming");
  });

  it("treats value=0 as the first step being active, not complete", () => {
    expect(getStepStatus(0, 0)).toBe("active");
    expect(getStepStatus(1, 0)).toBe("upcoming");
  });
});
