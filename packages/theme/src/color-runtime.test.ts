import { generateColorToken } from "@quickadui/tokens";
import { beforeEach, describe, expect, it } from "vitest";
import {
  applyColorOverrides,
  clearAllColorOverrides,
  COLOR_FAMILIES,
  isHexColor,
  readStoredColorOverrides,
  storeColorOverrides,
} from "./color-runtime";

const STORAGE_KEY = "quickadui-colors";
const ACCENT_SEED = "#2563EB";

function readVar(family: string, step: number): string {
  return document.documentElement.style.getPropertyValue(`--qa-color-${family}-${step}`);
}

beforeEach(() => {
  localStorage.clear();
  clearAllColorOverrides();
});

describe("isHexColor", () => {
  it("accepts a well-formed #RRGGBB string, any case", () => {
    expect(isHexColor("#2563EB")).toBe(true);
    expect(isHexColor("#2563eb")).toBe(true);
  });

  it("rejects everything that isn't exactly #RRGGBB", () => {
    expect(isHexColor("#FFF")).toBe(false);
    expect(isHexColor("2563EB")).toBe(false);
    expect(isHexColor("rgb(37, 99, 235)")).toBe(false);
    expect(isHexColor("blue")).toBe(false);
    expect(isHexColor(undefined)).toBe(false);
    expect(isHexColor(42)).toBe(false);
  });
});

describe("COLOR_FAMILIES", () => {
  it("lists every family @quickadui/tokens knows about", () => {
    expect(COLOR_FAMILIES).toEqual(expect.arrayContaining(["accent", "neutral", "success", "warning", "danger"]));
    expect(COLOR_FAMILIES).toHaveLength(5);
  });
});

describe("applyColorOverrides / clearAllColorOverrides", () => {
  it("writes all 12 steps of the seed's light scale as inline custom properties", () => {
    applyColorOverrides({ accent: ACCENT_SEED }, "light");
    const expected = generateColorToken(ACCENT_SEED).light;
    expected.forEach((hex, i) => {
      expect(readVar("accent", i + 1)).toBe(hex);
    });
  });

  it("writes the dark scale instead when mode is dark", () => {
    applyColorOverrides({ accent: ACCENT_SEED }, "dark");
    const expected = generateColorToken(ACCENT_SEED).dark;
    expected.forEach((hex, i) => {
      expect(readVar("accent", i + 1)).toBe(hex);
    });
  });

  it("only touches the families present in the override map", () => {
    applyColorOverrides({ accent: ACCENT_SEED }, "light");
    expect(readVar("success", 9)).toBe("");
  });

  it("silently skips an invalid seed instead of throwing", () => {
    expect(() => applyColorOverrides({ accent: "not-a-color" }, "light")).not.toThrow();
    expect(readVar("accent", 9)).toBe("");
  });

  it("clearAllColorOverrides removes every inline property this module could have set", () => {
    applyColorOverrides({ accent: ACCENT_SEED, danger: "#FF0000" }, "light");
    clearAllColorOverrides();
    for (const family of COLOR_FAMILIES) {
      for (let step = 1; step <= 12; step++) {
        expect(readVar(family, step)).toBe("");
      }
    }
  });
});

describe("readStoredColorOverrides / storeColorOverrides", () => {
  it("round-trips a stored override map", () => {
    storeColorOverrides(STORAGE_KEY, { accent: ACCENT_SEED });
    expect(readStoredColorOverrides(STORAGE_KEY)).toEqual({ accent: ACCENT_SEED });
  });

  it("returns an empty object when nothing is stored", () => {
    expect(readStoredColorOverrides(STORAGE_KEY)).toEqual({});
  });

  it("clears the storage key entirely once the map is emptied, rather than storing '{}'", () => {
    storeColorOverrides(STORAGE_KEY, { accent: ACCENT_SEED });
    storeColorOverrides(STORAGE_KEY, {});
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("drops an unknown family key from a hand-edited stored value", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accent: ACCENT_SEED, notAFamily: "#000000" }));
    expect(readStoredColorOverrides(STORAGE_KEY)).toEqual({ accent: ACCENT_SEED });
  });

  it("drops a malformed color value from a hand-edited stored value", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accent: "blue" }));
    expect(readStoredColorOverrides(STORAGE_KEY)).toEqual({});
  });

  it("returns an empty object for corrupted JSON instead of throwing", () => {
    localStorage.setItem(STORAGE_KEY, "{not json");
    expect(() => readStoredColorOverrides(STORAGE_KEY)).not.toThrow();
    expect(readStoredColorOverrides(STORAGE_KEY)).toEqual({});
  });

  it("returns an empty object for a stored value that isn't an object", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify("accent"));
    expect(readStoredColorOverrides(STORAGE_KEY)).toEqual({});
  });
});
