import { describe, expect, it } from "vitest";
import { defaultPasswordRules, getPasswordStrength } from "./password-strength";

describe("getPasswordStrength", () => {
  it.each([
    ["", 0, "Too weak"],
    ["abc", 1, "Weak"],
    ["abcdefgh", 2, "Fair"],
    ["abcdefg1", 3, "Fair"],
    ["Abcdefg1", 4, "Good"],
    ["Abcdef1!", 5, "Strong"],
  ] as const)("scores %j as %i/5 passed -> %s", (password, expectedScore, expectedLabel) => {
    const result = getPasswordStrength(password);
    expect(result.score).toBe(expectedScore);
    expect(result.total).toBe(5);
    expect(result.label).toBe(expectedLabel);
  });

  it.each([
    ["length", "Ab1!", "Ab1!cdef"],
    ["lowercase", "ABCDEF12!", "aBCDEF12!"],
    ["uppercase", "abcdef12!", "Abcdef12!"],
    ["number", "Abcdefgh!", "Abcdefgh1!"],
    ["symbol", "Abcdefg1", "Abcdefg1!"],
  ] as const)("the %s rule fails without it and passes with it", (ruleId, failing, passing) => {
    expect(getPasswordStrength(failing).rules.find((r) => r.id === ruleId)?.passed).toBe(false);
    expect(getPasswordStrength(passing).rules.find((r) => r.id === ruleId)?.passed).toBe(true);
  });

  it("preserves rule order in the result", () => {
    const result = getPasswordStrength("x");
    expect(result.rules.map((r) => r.id)).toEqual(defaultPasswordRules.map((r) => r.id));
  });

  it("accepts a custom rule set instead of the defaults", () => {
    const rules = [
      { id: "min4", label: "At least 4 characters", test: (value: string) => value.length >= 4 },
    ];
    expect(getPasswordStrength("abc", rules)).toMatchObject({
      score: 0,
      total: 1,
      label: "Too weak",
    });
    expect(getPasswordStrength("abcd", rules)).toMatchObject({
      score: 1,
      total: 1,
      label: "Strong",
    });
  });
});
