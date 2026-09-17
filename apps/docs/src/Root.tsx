import { Spinner } from "@quickadui/core";
import { lazy, Suspense, useEffect, useState } from "react";
import { DocsLayout } from "./layout/DocsLayout";
import { DEFAULT_SLUG, nav } from "./nav";

/**
 * Same router-free approach as `apps/playground`'s `Root.tsx` (see that
 * file's own comment for the full reasoning): reads `location.hash`,
 * re-renders on `hashchange`. Adding `react-router-dom` would be one more
 * dependency this sandbox can't validate against real types with no npm
 * registry access — the docs MVP has six known pages, so a hash lookup is
 * the smallest thing that works.
 */
function useHashSlug(): string {
  const [slug, setSlug] = useState(() => window.location.hash.slice(1) || DEFAULT_SLUG);
  useEffect(() => {
    const onHashChange = () => setSlug(window.location.hash.slice(1) || DEFAULT_SLUG);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  return slug;
}

// Keep in sync with `nav.ts`'s page list — each entry lazily loads one
// hand-written MDX page from `src/pages`.
const PAGES = {
  introduction: lazy(() => import("./pages/introduction.mdx")),
  tokens: lazy(() => import("./pages/tokens.mdx")),
  primitives: lazy(() => import("./pages/primitives.mdx")),
  core: lazy(() => import("./pages/core.mdx")),
  forms: lazy(() => import("./pages/forms.mdx")),
  data: lazy(() => import("./pages/data.mdx")),
} as const;

type Slug = keyof typeof PAGES;

function isKnownSlug(slug: string): slug is Slug {
  return slug in PAGES;
}

export function Root() {
  const rawSlug = useHashSlug();
  const activeSlug: Slug = isKnownSlug(rawSlug) ? rawSlug : DEFAULT_SLUG;
  const Page = PAGES[activeSlug];

  return (
    <DocsLayout nav={nav} activeSlug={activeSlug}>
      <Suspense
        fallback={
          <div className="flex justify-center p-12">
            <Spinner label="Loading page" />
          </div>
        }
      >
        <div className="qa-prose">
          <Page />
        </div>
      </Suspense>
    </DocsLayout>
  );
}
