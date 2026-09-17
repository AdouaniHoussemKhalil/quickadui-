import { type ColorFamily, generateColorToken, SEED_COLORS } from "@quickadui/tokens";
import type { ResolvedTheme } from "./dom";

/**
 * Runtime brand-color overrides: change `accent` (or any other
 * `@quickadui/tokens` `ColorFamily`) to an arbitrary seed color without a
 * rebuild, by regenerating that family's 12-step scale on the fly (with
 * the exact same `generateColorToken` used to bake `tokens.css` at build
 * time) and writing it back as inline CSS custom properties.
 *
 * Known gap: unlike theme *mode* (see `dom.ts`'s `getThemeScript`), a
 * stored color override has no pre-paint inline-script equivalent here.
 * `ThemeScript` only ever applies `data-theme`, so a returning visitor
 * with a custom accent still sees one frame of the build-time brand color
 * before `<ThemeProvider>` mounts and calls `applyColorOverrides`.
 * Inlining an equivalent script would mean shipping the OKLCH scale
 * generator itself (all of `oklch.ts` + `scale.ts`) as a second copy of
 * plain JS text — not done here; this module trades that one-frame flash
 * for staying a thin wrapper around the same code path `ThemeProvider`
 * already runs on every mode change.
 */

/** A seed-color override for zero or more families. Only listed families are overridden — everything else keeps its build-time `tokens.css` value. */
export type ColorOverrides = Partial<Record<ColorFamily, string>>;

/** Every family the token system knows about, in a stable order — driven by `@quickadui/tokens`' own `SEED_COLORS`, never hand-duplicated here. */
export const COLOR_FAMILIES = Object.keys(SEED_COLORS) as ColorFamily[];

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

/** True for a `#RRGGBB` string (case-insensitive) — the same shape `SEED_COLORS` itself uses. Anything else (short hex, `rgb()`, a named color, `undefined`) is rejected: `generateColorToken`'s OKLCH math only accepts this shape. */
export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && HEX_COLOR_PATTERN.test(value);
}

function stepProperty(family: ColorFamily, step: number): string {
  return `--qa-color-${family}-${step}`;
}

/**
 * Writes one family's full 12-step scale for `mode` as inline custom
 * properties on `root`. Inline `style` declarations win the CSS cascade
 * over every selector `tokens-css.ts` generates (`:root`, the
 * `@media (prefers-color-scheme: dark)` block, `[data-theme="dark"]`)
 * regardless of specificity — that's what lets one call here override the
 * build-time-baked scale for a single family without touching the
 * stylesheet, fighting `!important`, or re-implementing the three-state
 * light/dark selector logic. See `tokens-css.ts`'s `generateTokensCss`.
 */
function applyFamilyOverride(
  family: ColorFamily,
  seedHex: string,
  mode: ResolvedTheme,
  root: HTMLElement,
): void {
  const scale = generateColorToken(seedHex)[mode];
  scale.forEach((hex, i) => {
    root.style.setProperty(stepProperty(family, i + 1), hex);
  });
}

function clearFamilyOverride(family: ColorFamily, root: HTMLElement): void {
  for (let step = 1; step <= 12; step++) {
    root.style.removeProperty(stepProperty(family, step));
  }
}

/**
 * Applies every override in `overrides` for the given resolved mode.
 * Call this again whenever `overrides` changes *or* the resolved
 * light/dark mode changes — each mode has its own generated scale, so a
 * switch from light to dark needs the dark half of the same seed
 * reapplied, not just a CSS variable that was already sitting there.
 * Silently skips any value that isn't a valid `#RRGGBB` hex string,
 * matching the rest of this file's fail-soft-and-keep-the-build-time-color
 * behavior rather than throwing at apply time.
 */
export function applyColorOverrides(
  overrides: ColorOverrides,
  mode: ResolvedTheme,
  root: HTMLElement = document.documentElement,
): void {
  for (const family of COLOR_FAMILIES) {
    const seed = overrides[family];
    if (isHexColor(seed)) {
      applyFamilyOverride(family, seed, mode, root);
    }
  }
}

/** Removes every inline color override this module could have set, for every known family — reverting `root` entirely back to whatever `tokens.css` itself says for the current mode. */
export function clearAllColorOverrides(root: HTMLElement = document.documentElement): void {
  for (const family of COLOR_FAMILIES) {
    clearFamilyOverride(family, root);
  }
}

function isColorFamily(value: string): value is ColorFamily {
  return (COLOR_FAMILIES as readonly string[]).includes(value);
}

/** Reads a previously stored override map back out of `localStorage`, dropping any key that isn't a real `ColorFamily` and any value that isn't a valid hex color — a corrupted or hand-edited entry is skipped rather than crashing the whole read. */
export function readStoredColorOverrides(storageKey: string): ColorOverrides {
  if (typeof window === "undefined") {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return {};
    }
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return {};
    }
    const result: ColorOverrides = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (isColorFamily(key) && isHexColor(value)) {
        result[key] = value;
      }
    }
    return result;
  } catch {
    return {}; // corrupted JSON, private browsing, storage disabled, ...
  }
}

/** Persists `overrides` to `localStorage`, or clears the key entirely once the map is empty (so a fully-reset theme doesn't leave a stale `"{}"` behind). */
export function storeColorOverrides(storageKey: string, overrides: ColorOverrides): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    if (Object.keys(overrides).length === 0) {
      window.localStorage.removeItem(storageKey);
    } else {
      window.localStorage.setItem(storageKey, JSON.stringify(overrides));
    }
  } catch {
    // Storage failed — overrides just won't persist across reloads this session.
  }
}
