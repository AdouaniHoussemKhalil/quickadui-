import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applyTheme,
  getThemeScript,
  readStoredTheme,
  resolveTheme,
  storeTheme,
  type ResolvedTheme,
  type ThemeMode,
} from "./dom";

export interface ThemeProviderProps {
  children: ReactNode;
  /** Used only on the very first visit, before anything is stored. Default: "system". */
  defaultTheme?: ThemeMode;
  /** localStorage key. Must match whatever key is passed to `<ThemeScript>` / `getThemeScript()`. */
  storageKey?: string;
}

export interface ThemeContextValue {
  /** The user's chosen mode — may be "system". */
  theme: ThemeMode;
  /** What "system" currently resolves to — always "light" or "dark", never "system". */
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Provides `theme` / `resolvedTheme` / `setTheme` to the subtree via
 * `useTheme()`, and keeps `document.documentElement`'s `data-theme`
 * attribute (and localStorage) in sync as the mode changes.
 *
 * This does *not* prevent the flash of the wrong theme on first paint by
 * itself — pair it with `<ThemeScript>` (or `getThemeScript()` inlined
 * manually) rendered as early as possible in `<head>`. See `dom.ts` for why
 * that has to be a plain script tag rather than an effect here.
 */
export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "quickadui-theme",
}: ThemeProviderProps) {
  // Lazy initializer: reads localStorage synchronously during the first
  // render so this matches what the inline ThemeScript already painted,
  // instead of flashing back to `defaultTheme` for one frame. On the server
  // (SSR) `readStoredTheme` returns null and we fall back to `defaultTheme`,
  // exactly like the script does.
  const [theme, setThemeState] = useState<ThemeMode>(() => readStoredTheme(storageKey) ?? defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(theme));

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

  const value = useMemo<ThemeContextValue>(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Reads the current theme mode/resolution and a setter. Throws outside a `<ThemeProvider>`. */
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
 */
export function ThemeScript({ storageKey = "quickadui-theme" }: ThemeScriptProps) {
  // biome-ignore lint/security/noDangerouslySetInnerHtml: this is the whole point — a script tag that must run before hydration, built from a fixed, non-user-controlled template in getThemeScript().
  return <script dangerouslySetInnerHTML={{ __html: getThemeScript(storageKey) }} />;
}
