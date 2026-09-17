export interface NavPage {
  slug: string;
  label: string;
}

export interface NavGroup {
  label: string;
  pages: NavPage[];
}

/**
 * The docs app's fixed page list — hand-written pages (an introduction
 * plus one overview per covered package), not one page per component. See
 * the project status doc: this package set and "hand-written pages, not
 * generated" are both explicit, user-confirmed scope decisions. Covers
 * every visual package plus `theme` — `utils`/`hooks` (non-visual
 * utilities) and `config`/`cli` (tooling) are deliberately out of scope,
 * documented elsewhere. `Root.tsx`'s `PAGES` map is the other half of this
 * list — keep both in sync when a page is added.
 */
export const nav: NavGroup[] = [
  { label: "Introduction", pages: [{ slug: "introduction", label: "Introduction" }] },
  { label: "Tokens", pages: [{ slug: "tokens", label: "Overview" }] },
  { label: "Theme", pages: [{ slug: "theme", label: "Overview" }] },
  { label: "Primitives", pages: [{ slug: "primitives", label: "Overview" }] },
  { label: "Core", pages: [{ slug: "core", label: "Overview" }] },
  { label: "Layout", pages: [{ slug: "layout", label: "Overview" }] },
  { label: "Forms", pages: [{ slug: "forms", label: "Overview" }] },
  { label: "Data", pages: [{ slug: "data", label: "Overview" }] },
  { label: "Overlays", pages: [{ slug: "overlays", label: "Overview" }] },
  { label: "Shell", pages: [{ slug: "shell", label: "Overview" }] },
  { label: "Charts", pages: [{ slug: "charts", label: "Overview" }] },
  { label: "Animation", pages: [{ slug: "animation", label: "Overview" }] },
  { label: "Icons", pages: [{ slug: "icons", label: "Overview" }] },
];

export const DEFAULT_SLUG = "introduction" as const;
