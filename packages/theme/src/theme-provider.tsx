import type { ColorFamily } from "@quickadui/tokens";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  applyColorOverrides,
  type ColorOverrides,
  clearAllColorOverrides,
  isHexColor,
  readStoredColorOverrides,
  storeColorOverrides,
} from "./color-runtime";
import {
  applyTheme,
  getThemeScript,
  type ResolvedTheme,
  readStoredTheme,
  resolveTheme,
  storeTheme,
  type ThemeMode,
} from "./dom";

export interface ThemeProviderProps {
  children: ReactNode;
  /** Used only on the very first visit, before anything is stored. Default: "system". */
  defaultTheme?: ThemeMode;
  /** localStorage key. Must match whatever key is passed to `<ThemeScript>` / `getThemeScript()`. */
  storageKey?: string;
  /**
   * Seed-color overrides (e.g. `{ accent: "#2563EB" }`) used only on the
   * very first visit, before anything is stored — same "first visit only"
   * relationship `defaultTheme` has to the persisted mode. Pass this to
   * ship a different brand color than `@quickadui/tokens`' own
   * `SEED_COLORS` without forking or rebuilding the package; call
   * `setColor` from `useTheme()` afterward to change it again at runtime.
   */
  defaultColors?: ColorOverrides;
  /** localStorage key for `defaultColors`/`setColor` overrides. Default: "quickadui-colors". */
  colorStorageKey?: string;
}

export interface ThemeContextValue {
  /** The user's chosen mode — may be "system". */
  theme: ThemeMode;
  /** What "system" currently resolves to — always "light" or "dark", never "system". */
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  /** The families currently overridden away from `@quickadui/tokens`' build-time `SEED_COLORS`, keyed by family, each a `#RRGGBB` seed. A family absent here is using its build-time color. */
  colors: ColorOverrides;
  /**
   * Regenerates `family`'s full 12-step light+dark scale from `seedHex`
   * (the same `generateColorToken` used to build `tokens.css` in the
   * first place) and applies it to the document immediately — no rebuild,
   * no page reload. Persists to `colorStorageKey` so it survives a
   * reload too. Throws if `seedHex` isn't a valid `#RRGGBB` string.
   */
  setColor: (family: ColorFamily, seedHex: string) => void;
  /** Reverts one family back to its build-time `tokens.css` color. */
  resetColor: (family: ColorFamily) => void;
  /** Reverts every overridden family back to its build-time `tokens.css` color. */
  resetColors: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const DEFAULT_COLOR_STORAGE_KEY = "quickadui-colors";

/**
 * Provides `theme` / `resolvedTheme` / `setTheme` (mode) and `colors` /
 * `setColor` / `resetColor` / `resetColors` (brand color) to the subtree
 * via `useTheme()`, and keeps `document.documentElement` (both its
 * `data-theme` attribute and, for any overridden color family, its inline
 * `--qa-color-*` custom properties) and `localStorage` in sync as either
 * changes.
 *
 * This does *not* prevent the flash of the wrong theme *mode* on first
 * paint by itself — pair it with `<ThemeScript>` (or `getThemeScript()`
 * inlined manually) rendered as early as possible in `<head>`. See
 * `dom.ts` for why that has to be a plain script tag rather than an effect
 * here. A stored *color* override is, for the same reason, not applied
 * until this component mounts — see `color-runtime.ts`'s module doc for
 * why that's a smaller, and so far unaddressed, gap.
 */
export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "quickadui-theme",
  defaultColors,
  colorStorageKey = DEFAULT_COLOR_STORAGE_KEY,
}: ThemeProviderProps) {
  // Lazy initializer: reads localStorage synchronously during the first
  // render so this matches what the inline ThemeScript already painted,
  // instead of flashing back to `defaultTheme` for one frame. On the server
  // (SSR) `readStoredTheme` returns null and we fall back to `defaultTheme`,
  // exactly like the script does.
  const [theme, setThemeState] = useState<ThemeMode>(
    () => readStoredTheme(storageKey) ?? defaultTheme,
  );
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(theme));

  // Same "stored wins, otherwise the default prop" relationship as theme
  // mode above — a returning visitor's own custom color always wins over
  // whatever `defaultColors` this render happens to pass.
  const [colors, setColors] = useState<ColorOverrides>(() => {
    const stored = readStoredColorOverrides(colorStorageKey);
    return Object.keys(stored).length > 0 ? stored : (defaultColors ?? {});
  });

  const setTheme = useCallback(
    (next: ThemeMode) => {
      setThemeState(next);
      storeTheme(storageKey, next);
    },
    [storageKey],
  );

  // Apply to the DOM whenever the chosen mode changes.
  useEffect(() => {
    applyTheme(theme);
    setResolvedTheme(resolveTheme(theme));
  }, [theme]);

  // While in "system" mode, track OS preference changes live (e.g. the user
  // flips their OS from light to dark without touching this app).
  useEffect(() => {
    if (theme !== "system" || typeof window === "undefined" || !window.matchMedia) {
      return;
    }
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setResolvedTheme(mql.matches ? "dark" : "light");
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [theme]);

  // Re-apply every color override whenever the map changes *or* the
  // resolved light/dark mode changes — each mode has its own generated
  // scale, so toggling dark/light needs the other half of the same seed
  // recomputed, not just whatever inline value happened to be sitting
  // there. Clearing first (rather than only ever setting) is what makes
  // `resetColor`/`resetColors` actually remove the inline override instead
  // of leaving the last-applied value stuck in place.
  useEffect(() => {
    clearAllColorOverrides();
    applyColorOverrides(colors, resolvedTheme);
  }, [colors, resolvedTheme]);

  const setColor = useCallback(
    (family: ColorFamily, seedHex: string) => {
      if (!isHexColor(seedHex)) {
        throw new Error(
          `setColor("${family}", ...): "${seedHex}" is not a valid #RRGGBB hex color.`,
        );
      }
      setColors((prev) => {
        const next = { ...prev, [family]: seedHex };
        storeColorOverrides(colorStorageKey, next);
        return next;
      });
    },
    [colorStorageKey],
  );

  const resetColor = useCallback(
    (family: ColorFamily) => {
      setColors((prev) => {
        if (!(family in prev)) {
          return prev;
        }
        const next = { ...prev };
        delete next[family];
        storeColorOverrides(colorStorageKey, next);
        return next;
      });
    },
    [colorStorageKey],
  );

  const resetColors = useCallback(() => {
    setColors({});
    storeColorOverrides(colorStorageKey, {});
  }, [colorStorageKey]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme, colors, setColor, resetColor, resetColors }),
    [theme, resolvedTheme, setTheme, colors, setColor, resetColor, resetColors],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Reads the current theme mode/resolution/colors and their setters. Throws outside a `<ThemeProvider>`. */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme() must be used within a <ThemeProvider>.");
  }
  return ctx;
}

export interface ThemeScriptProps {
  /** Must match the `storageKey` passed to `<ThemeProvider>`. Default: "quickadui-theme". */
  storageKey?: string;
}

/**
 * Inlines `getThemeScript()` as a `<script>` tag. Render this as early as
 * possible in `<head>` — ahead of anything that could paint in the wrong
 * theme, and ahead of `<ThemeProvider>` — e.g. in a Next.js root layout's
 * `<head>`. The generated string is a fixed template with no user input
 * interpolated unescaped into it (the storage key is passed through
 * `JSON.stringify`), so inlining it is safe. See `dom.ts` for details.
 *
 * This only covers theme *mode* — it does not inline a stored color
 * override, so a returning visitor with a custom accent color still sees
 * one frame of the build-time brand color before `<ThemeProvider>` mounts
 * and corrects it. See `color-runtime.ts`'s module doc.
 */
export function ThemeScript({ storageKey = "quickadui-theme" }: ThemeScriptProps) {
  // biome-ignore lint/security/noDangerouslySetInnerHtml: this is the whole point — a script tag that must run before hydration, built from a fixed, non-user-controlled template in getThemeScript().
  return <script dangerouslySetInnerHTML={{ __html: getThemeScript(storageKey) }} />;
}
