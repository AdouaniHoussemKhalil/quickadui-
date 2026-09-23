// Pure helpers for the "Label:href,Label2:href2" mini-format used by
// `generate app`'s --navbar-items/--sidebar-items flags and interactive
// prompts, plus deriving that same shape automatically from whatever
// `discover-features.ts` already found — so a person can just accept the
// default instead of retyping every page's href by hand.

import type { DiscoveredFeature } from "./discover-features.js";

export interface NavItem {
  readonly label: string;
  readonly href: string;
  /** One of `@quickadui/icons`' exported names, without the `Icon` suffix (e.g. `"Home"` for `HomeIcon`) — not verified against the real package's export list here (this CLI doesn't depend on `@quickadui/icons` at build time), so a typo surfaces as a broken import in the *generated* project, not here. */
  readonly icon?: string;
}

/**
 * One item per already-generated feature, in the order `discoverFeatures`
 * returned them (resource pages first, then login, then profile) — used
 * both as the interactive prompt's pre-filled default and as the actual
 * items when a flag/prompt answer is skipped entirely (e.g. `--yes`).
 */
export function defaultNavItems(features: readonly DiscoveredFeature[]): readonly NavItem[] {
  return features.map((feature) =>
    feature.kind === "resource"
      ? { label: feature.label, href: `#/${feature.endpoint}` }
      : { label: feature.label, href: feature.href },
  );
}

/** The inverse of `parseNavItemsSpec` — used to pre-fill the interactive prompt with the auto-detected default, in the same syntax a person would type back. */
export function formatNavItemsSpec(items: readonly NavItem[]): string {
  return items
    .map((item) =>
      item.icon !== undefined
        ? `${item.label}:${item.href}:${item.icon}`
        : `${item.label}:${item.href}`,
    )
    .join(",");
}

/**
 * Parses "Label:href,Label2:href2" (or "Label:href:Icon" with an optional
 * third `:`-separated segment naming an `@quickadui/icons` export, minus
 * its `Icon` suffix) into `NavItem[]`. Blank entries (trailing commas,
 * all-whitespace input) are silently skipped rather than rejected — an
 * empty result is valid (it just means no nav items), unlike
 * `field-spec.ts`'s `parseFieldSpec`, where an empty/malformed entry is
 * always a mistake worth failing loudly on. An entry with no ":" uses the
 * label itself, kebab-lowercased with spaces turned into "-", as a hash
 * href guess — good enough for a person naming a custom item like "Docs"
 * that isn't one of the generated pages (and carries no icon). A trailing
 * empty icon segment ("Label:href:") is treated the same as omitting it
 * entirely, not as an empty-string icon name.
 */
export function parseNavItemsSpec(spec: string): readonly NavItem[] {
  return spec
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .map((entry) => {
      const firstColon = entry.indexOf(":");
      if (firstColon === -1) {
        const href = `#/${entry.trim().toLowerCase().replace(/\s+/g, "-")}`;
        return { label: entry.trim(), href };
      }
      const label = entry.slice(0, firstColon).trim();
      const rest = entry.slice(firstColon + 1);
      const secondColon = rest.indexOf(":");
      if (secondColon === -1) {
        return { label, href: rest.trim() };
      }
      const href = rest.slice(0, secondColon).trim();
      const icon = rest.slice(secondColon + 1).trim();
      return icon === "" ? { label, href } : { label, href, icon };
    })
    .filter((item) => item.label.length > 0);
}
