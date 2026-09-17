import { cn } from "@quickadui/utils";
import type { NavGroup } from "../nav";

export interface SidebarProps {
  nav: NavGroup[];
  activeSlug: string;
}

/**
 * No mobile menu toggle yet — the sidebar simply hides below the `sm`
 * breakpoint (`hidden sm:block`). A hamburger toggle is a reasonable
 * follow-up but adds state this MVP pass didn't need; noted here rather
 * than silently shipped as if it were a considered decision.
 */
export function Sidebar({ nav, activeSlug }: SidebarProps) {
  return (
    <nav className="hidden w-64 shrink-0 border-r border-neutral-6 px-4 py-8 sm:block">
      {nav.map((group) => (
        <div key={group.label} className="mb-6">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-neutral-9">
            {group.label}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.pages.map((page) => (
              <li key={page.slug}>
                <a
                  href={`#${page.slug}`}
                  className={cn(
                    "block rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-neutral-3",
                    activeSlug === page.slug
                      ? "bg-accent-3 font-medium text-accent-11"
                      : "text-neutral-11",
                  )}
                >
                  {page.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
