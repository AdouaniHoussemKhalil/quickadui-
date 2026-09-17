export interface NavPage {
  slug: string;
  label: string;
}

export interface NavGroup {
  label: string;
  pages: NavPage[];
}

/**
 * The docs MVP's fixed page list — six hand-written pages (an
 * introduction plus one overview per covered package), not one page per
 * component. See the project status doc: this restricted package set
 * (`tokens`/`primitives`/`core`/`forms`/`data`) and "hand-written pages,
 * not generated" are both explicit, user-confirmed MVP scope decisions.
 * `Root.tsx`'s `PAGES` map is the other half of this list — keep both in
 * sync when a page is added.
 */
export const nav: NavGroup[] = [
  { label: "Introduction", pages: [{ slug: "introduction", label: "Introduction" }] },
  { label: "Tokens", pages: [{ slug: "tokens", label: "Overview" }] },
  { label: "Primitives", pages: [{ slug: "primitives", label: "Overview" }] },
  { label: "Core", pages: [{ slug: "core", label: "Overview" }] },
  { label: "Forms", pages: [{ slug: "forms", label: "Overview" }] },
  { label: "Data", pages: [{ slug: "data", label: "Overview" }] },
];

export const DEFAULT_SLUG = "introduction" as const;
