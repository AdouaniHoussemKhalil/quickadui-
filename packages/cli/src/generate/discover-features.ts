// Scans a project's src/pages (and src/auth) for pages an earlier
// `quickadui generate resource`/`generate auth` run already wrote, so
// `quickadui generate app` can wire navigation to them automatically
// instead of asking the person to retype what's already there. Same "touches
// the filesystem, but read-only and deterministic" spot as
// check-prerequisites.ts — not a pure function, but safe and worth testing
// against real temp directories the way that file is.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { toCamelCase, toLabel, toNaivePlural } from "./case.js";

export interface DiscoveredResourceFeature {
  readonly kind: "resource";
  /** e.g. "Product" — taken straight from the "<Pascal>ListPage.tsx" filename, never re-derived by guesswork. */
  readonly pascal: string;
  /** e.g. "product" — the FormPage's id prop is "${camel}Id", derived the same way resource-templates.ts derived it, so it's guaranteed to match. */
  readonly camel: string;
  /** e.g. "product" — the folder name on disk, used to build import paths. */
  readonly kebab: string;
  /** e.g. "products" — the URL path segment the generated pages actually link to. */
  readonly endpoint: string;
  /** e.g. "Products" — for a nav item label. */
  readonly label: string;
}

export interface DiscoveredAuthFeature {
  readonly kind: "login" | "profile";
  readonly label: string;
  readonly href: string;
}

export type DiscoveredFeature = DiscoveredResourceFeature | DiscoveredAuthFeature;

const LIST_PAGE_SUFFIX = "ListPage.tsx";

/**
 * Recovers the endpoint a generated `<Pascal>ListPage.tsx` actually links
 * to, by pattern-matching its own "New <thing>" button link
 * (`href="#/<endpoint>/new"`) — the one piece of information the file name
 * alone doesn't carry, since `--endpoint` can differ from the naive plural
 * of the type name. This is deliberately a narrow match against a fixed
 * string this same package's `resource-templates.ts` always emits, not a
 * general-purpose parser; if it ever doesn't match (e.g. someone hand-edited
 * the file), falling back to the folder's kebab name is a reasonable
 * degradation, not a crash.
 */
function extractEndpoint(listPageContents: string, fallbackKebab: string): string {
  const match = listPageContents.match(/href="#\/([^/"]+)\/new"/);
  return match?.[1] ?? fallbackKebab;
}

function discoverResourceFeatures(projectDir: string): DiscoveredResourceFeature[] {
  const pagesDir = join(projectDir, "src", "pages");
  if (!existsSync(pagesDir)) {
    return [];
  }

  const features: DiscoveredResourceFeature[] = [];

  for (const entry of readdirSync(pagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue; // LoginPage.tsx/ProfilePage.tsx live directly in src/pages, not a subfolder — handled separately below.
    }
    const kebab = entry.name;
    const featureDir = join(pagesDir, kebab);
    const listPageFile = readdirSync(featureDir).find((name) => name.endsWith(LIST_PAGE_SUFFIX));
    if (!listPageFile) {
      continue;
    }
    const pascal = listPageFile.slice(0, -LIST_PAGE_SUFFIX.length);
    if (pascal.length === 0) {
      continue;
    }
    const contents = readFileSync(join(featureDir, listPageFile), "utf8");
    const endpoint = extractEndpoint(contents, kebab);
    features.push({
      kind: "resource",
      pascal,
      camel: toCamelCase(pascal),
      kebab,
      endpoint,
      label: toLabel(toNaivePlural(pascal)),
    });
  }

  return features;
}

function discoverAuthFeatures(projectDir: string): DiscoveredAuthFeature[] {
  const pagesDir = join(projectDir, "src", "pages");
  const features: DiscoveredAuthFeature[] = [];

  if (existsSync(join(pagesDir, "LoginPage.tsx"))) {
    features.push({ kind: "login", label: "Login", href: "#/login" });
  }
  if (existsSync(join(pagesDir, "ProfilePage.tsx"))) {
    features.push({ kind: "profile", label: "Profile", href: "#/profile" });
  }

  return features;
}

/**
 * Finds every resource (from `generate resource`) and auth (from
 * `generate auth`) page already generated into `projectDir`. Returns `[]`
 * piece by piece rather than throwing when nothing (or only some) of it
 * exists — `generate app` is meant to run before, after, or interleaved
 * with those other two commands, in any combination.
 */
export function discoverFeatures(projectDir: string): readonly DiscoveredFeature[] {
  return [...discoverResourceFeatures(projectDir), ...discoverAuthFeatures(projectDir)];
}
