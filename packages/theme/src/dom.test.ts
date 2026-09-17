import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applyTheme,
  getSystemTheme,
  getThemeScript,
  readStoredTheme,
  resolveTheme,
  storeTheme,
} from "./dom";

const STORAGE_KEY = "quickadui-theme";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

describe("applyTheme", () => {
  it('sets data-theme="dark" for "dark"', () => {
    applyTheme("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it('sets data-theme="light" for "light"', () => {
    applyTheme("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it('removes the attribute entirely for "system" (lets prefers-color-scheme win)', () => {
    applyTheme("dark");
    applyTheme("system");
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
  });
});

describe("resolveTheme / getSystemTheme", () => {
  it("resolves light/dark to themselves", () => {
    expect(resolveTheme("light")).toBe("light");
    expect(resolveTheme("dark")).toBe("dark");
  });

  it("falls back to a real ResolvedTheme value for system", () => {
    expect(["light", "dark"]).toContain(resolveTheme("system"));
    expect(["light", "dark"]).toContain(getSystemTheme());
  });
});

describe("readStoredTheme / storeTheme", () => {
  it("round-trips a stored value", () => {
    storeTheme(STORAGE_KEY, "dark");
    expect(readStoredTheme(STORAGE_KEY)).toBe("dark");
  });

  it("returns null when nothing is stored", () => {
    expect(readStoredTheme(STORAGE_KEY)).toBeNull();
  });

  it("returns null for a corrupted/unrelated stored value instead of throwing", () => {
    localStorage.setItem(STORAGE_KEY, "not-a-theme");
    expect(readStoredTheme(STORAGE_KEY)).toBeNull();
  });
});

describe("getThemeScript", () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  function run(script: string) {
    // The script is meant to run as an inline <script> tag, executing in
    // global scope with `document`/`localStorage` already available — the
    // Function constructor is the closest a unit test gets to that without
    // actually injecting a <script> element into jsdom. Biome's
    // `noGlobalEval` rule only targets literal `eval()` calls, not `new
    // Function(...)`, so there's nothing here for it to flag.
    new Function(script)();
  }

  it("is syntactically valid JavaScript", () => {
    expect(() => run(getThemeScript(STORAGE_KEY))).not.toThrow();
  });

  it("applies a stored dark preference before any React code runs", () => {
    localStorage.setItem(STORAGE_KEY, "dark");
    run(getThemeScript(STORAGE_KEY));
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("applies a stored light preference", () => {
    localStorage.setItem(STORAGE_KEY, "light");
    run(getThemeScript(STORAGE_KEY));
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("leaves the attribute unset when nothing is stored (system)", () => {
    run(getThemeScript(STORAGE_KEY));
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
  });

  it("never throws even if localStorage access itself throws", () => {
    const original = Storage.prototype.getItem;
    Storage.prototype.getItem = () => {
      throw new Error("storage disabled");
    };
    expect(() => run(getThemeScript(STORAGE_KEY))).not.toThrow();
    Storage.prototype.getItem = original;
  });

  it("embeds a custom storage key safely, including one with quotes", () => {
    const script = getThemeScript('weird"key');
    expect(() => run(script)).not.toThrow();
  });
});
