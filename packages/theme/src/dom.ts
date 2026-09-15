export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

/** The visitor's OS/browser preference, defaulting to "light" when unknown (SSR, no matchMedia). */
export function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  return mode === "system" ? getSystemTheme() : mode;
}

/**
 * Applies a theme mode to the document root. "system" *removes* the
 * attribute entirely rather than writing `data-theme="system"` — an absent
 * attribute is what lets `prefers-color-scheme` take over, per the
 * three-state pattern in the QuickadUI Blueprint, §7.
 */
export function applyTheme(mode: ThemeMode, root: HTMLElement = document.documentElement): void {
  if (mode === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", mode);
  }
}

function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

export function readStoredTheme(storageKey: string): ThemeMode | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(storageKey);
    return isThemeMode(value) ? value : null;
  } catch {
    return null; // private browsing, storage disabled, quota exceeded, ...
  }
}

export function storeTheme(storageKey: string, mode: ThemeMode): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, mode);
  } catch {
    // Storage failed — the theme just won't persist across reloads this session.
  }
}

/**
 * A self-contained script, safe to inline via a `<script>` tag in the
 * document head (e.g. `dangerouslySetInnerHTML` in React, or directly in a
 * static HTML entry), that applies the stored theme *before first paint*.
 * This is what an effect-based approach cannot do — by the time a
 * `useEffect` runs, the first frame has already rendered in the wrong
 * theme. See `ThemeScript` in `theme-provider.tsx` for the React wrapper,
 * and the Blueprint, §7, for why this has to be a script tag and not JS
 * that runs after hydration.
 */
export function getThemeScript(storageKey = "quickadui-theme"): string {
  const key = JSON.stringify(storageKey);
  return `(function(){try{var m=localStorage.getItem(${key});if(m==="light"||m==="dark"){document.documentElement.setAttribute("data-theme",m);}else{document.documentElement.removeAttribute("data-theme");}}catch(e){}})();`;
}
