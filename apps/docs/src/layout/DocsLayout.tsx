import type { ReactNode } from "react";
import { AccentPicker } from "../components/AccentPicker";
import { ThemeToggle } from "../components/ThemeToggle";
import type { NavGroup } from "../nav";
import { Sidebar } from "./Sidebar";

export interface DocsLayoutProps {
  nav: NavGroup[];
  activeSlug: string;
  children: ReactNode;
}

export function DocsLayout({ nav, activeSlug, children }: DocsLayoutProps) {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl">
      <Sidebar nav={nav} activeSlug={activeSlug} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-neutral-6 px-8 py-4">
          <a href="#introduction" className="text-sm font-semibold tracking-tight text-neutral-12">
            QuickadUI Docs
          </a>
          <div className="flex items-center gap-3">
            <AccentPicker />
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 px-8 py-10">
          <div className="mx-auto max-w-3xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
