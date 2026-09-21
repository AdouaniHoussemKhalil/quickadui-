// Orchestrates `quickadui generate app`: the only place in this feature
// that touches the filesystem *or* talks to the person — everything it
// calls (discover-features.ts, nav-items.ts, app-shell-templates.ts) is
// pure or read-only. See prompts.ts's header comment for why this command
// alone is interactive.

import { existsSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { renderApp, type AppShellThemeColors, type AppShellThemeMode } from "../generate/app-shell-templates.js";
import { checkRequiredPackages } from "../generate/check-prerequisites.js";
import { discoverFeatures } from "../generate/discover-features.js";
import { defaultNavItems, formatNavItemsSpec, type NavItem, parseNavItemsSpec } from "../generate/nav-items.js";
import { createPrompter } from "../generate/prompts.js";
import { renderGenerateAppNextSteps } from "../generate/render-generate-next-steps.js";
import { writeScaffoldFiles } from "../generate/write-files.js";
import type { PackageJsonLike } from "../package-json.js";

const CORE_REQUIRED_PACKAGES = ["@quickadui/core", "@quickadui/theme"] as const;
const SHELL_REQUIRED_PACKAGE = "@quickadui/shell";
const OVERLAYS_REQUIRED_PACKAGE = "@quickadui/overlays";

export interface GenerateAppOptions {
  readonly projectDir: string;
  readonly force: boolean;
  /** `undefined` means "ask" (or, with `assumeYes`, "use the default") rather than "no". */
  readonly navbar?: boolean | undefined;
  readonly sidebar?: boolean | undefined;
  readonly footer?: boolean | undefined;
  readonly navbarItemsSpec?: string | undefined;
  readonly sidebarItemsSpec?: string | undefined;
  /** Skip every prompt, filling in defaults for anything not already settled by a flag. */
  readonly assumeYes?: boolean | undefined;
  /** Wired into `<ThemeProvider defaultTheme={...}>`. Currently only reachable via `quickadui apply <config.json>` — no CLI flag for it yet. */
  readonly defaultTheme?: AppShellThemeMode | undefined;
  /** Wired into `<ThemeProvider defaultColors={...}>`. Currently only reachable via `quickadui apply <config.json>`. */
  readonly defaultColors?: AppShellThemeColors | undefined;
  /** Mounts `<Toaster />` once, high in the tree. Currently only reachable via `quickadui apply <config.json>` — set when at least one resource has `toasts` configured. */
  readonly needsToaster?: boolean | undefined;
  /** Adds a `<DashboardPage />` router case at this hash. Currently only reachable via `quickadui apply <config.json>` — set to `dashboard.route` (default `"#/"`) whenever `dashboard.enabled` is true. */
  readonly dashboardRoute?: string | undefined;
  /** Text/logo shown in the navbar's/sidebar's brand slot. Currently only reachable via `quickadui apply <config.json>` — from `navbar.brand`/`navbar.logo`/`sidebar.brand`/`sidebar.logo`. Omit for `renderApp`'s own default (the project's name, as plain text). */
  readonly navbarBrand?: string | undefined;
  readonly navbarLogo?: string | undefined;
  readonly sidebarBrand?: string | undefined;
  readonly sidebarLogo?: string | undefined;
}

export interface GenerateAppResult {
  readonly filesWritten: readonly string[];
  readonly nextSteps: string;
}

function readProjectName(projectDir: string): string {
  const packageJsonPath = join(projectDir, "package.json");
  if (existsSync(packageJsonPath)) {
    try {
      const pkgJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as PackageJsonLike;
      if (typeof pkgJson.name === "string" && pkgJson.name.length > 0) {
        return pkgJson.name;
      }
    } catch {
      // Falls through to the directory-name fallback below — a
      // malformed package.json shouldn't block generating App.tsx, only
      // checkRequiredPackages (called separately) needs it to parse.
    }
  }
  return basename(projectDir);
}

/**
 * Generates `src/App.tsx`, wiring navigation to whatever `generate
 * resource`/`generate auth` already produced in `options.projectDir`, and
 * — interactively, unless every relevant flag or `assumeYes` says
 * otherwise — an optional Navbar/Sidebar/Footer shell plus a light/dark/
 * system theme toggle. See `app-shell-templates.ts`'s header comment for
 * what gets generated, and `prompts.ts`'s for why this command asks
 * questions when every other one doesn't.
 */
export async function runGenerateApp(options: GenerateAppOptions): Promise<GenerateAppResult> {
  const projectDir = resolve(options.projectDir);

  const appPath = join(projectDir, "src", "App.tsx");
  if (existsSync(appPath) && !options.force) {
    throw new Error(
      `"${appPath}" already exists. Pass --force to overwrite it (any hand edits to it will be lost).`,
    );
  }

  const features = discoverFeatures(projectDir);
  const hasAuth = features.some((feature) => feature.kind === "login" || feature.kind === "profile");
  // When a dashboard route is set, put it first in the auto-derived
  // default — same treatment `defaultNavItems` already gives every
  // resource/auth page, so a config (or an interactive `generate app`
  // run) that doesn't hand-write its own `navbar`/`sidebar` items still
  // gets a working link to the page it just generated, instead of a
  // dashboard nobody can navigate to. Only affects this default; an
  // explicit `navbarItemsSpec`/`sidebarItemsSpec` (or config `items`)
  // always wins, same as it already does for every other auto-detected
  // item.
  const defaultItems: readonly NavItem[] =
    options.dashboardRoute !== undefined
      ? [{ label: "Dashboard", href: options.dashboardRoute }, ...defaultNavItems(features)]
      : defaultNavItems(features);

  let navbar = options.navbar;
  let sidebar = options.sidebar;
  let footer = options.footer;
  let navbarItems: readonly NavItem[] | undefined =
    options.navbarItemsSpec !== undefined ? parseNavItemsSpec(options.navbarItemsSpec) : undefined;
  let sidebarItems: readonly NavItem[] | undefined =
    options.sidebarItemsSpec !== undefined ? parseNavItemsSpec(options.sidebarItemsSpec) : undefined;

  const somethingUnset = navbar === undefined || sidebar === undefined || footer === undefined;

  if (somethingUnset && !options.assumeYes) {
    const prompter = createPrompter();
    try {
      if (navbar === undefined) {
        navbar = await prompter.confirm("Add a Navbar?", true);
      }
      if (navbar && navbarItems === undefined) {
        const answer = await prompter.text("Navbar items (Label:href,...)", formatNavItemsSpec(defaultItems));
        navbarItems = parseNavItemsSpec(answer);
      }

      if (sidebar === undefined) {
        sidebar = await prompter.confirm("Add a Sidebar?", false);
      }
      if (sidebar && sidebarItems === undefined) {
        const answer = await prompter.text(
          "Sidebar items (Label:href,...)",
          formatNavItemsSpec(defaultItems),
        );
        sidebarItems = parseNavItemsSpec(answer);
      }

      if (footer === undefined) {
        footer = await prompter.confirm("Add a Footer?", true);
      }
    } finally {
      prompter.close();
    }
  }

  // Anything still unset here only happens with --yes (or a scripted call)
  // that didn't pin every option — fall back to sensible defaults instead
  // of asking, same "don't block on a question nobody's there to answer"
  // reasoning as everywhere else `assumeYes`-shaped behavior exists in
  // this codebase.
  navbar ??= true;
  sidebar ??= false;
  footer ??= true;
  navbarItems ??= navbar ? defaultItems : [];
  sidebarItems ??= sidebar ? defaultItems : [];

  const requiredPackages: string[] = [...CORE_REQUIRED_PACKAGES];
  if (navbar || sidebar || footer) {
    requiredPackages.push(SHELL_REQUIRED_PACKAGE);
  }
  if (options.needsToaster) {
    requiredPackages.push(OVERLAYS_REQUIRED_PACKAGE);
  }
  checkRequiredPackages(projectDir, requiredPackages);

  const projectName = readProjectName(projectDir);

  const file = renderApp({
    projectName,
    navbar,
    sidebar,
    footer,
    navbarItems: navbar ? navbarItems : [],
    sidebarItems: sidebar ? sidebarItems : [],
    hasAuth,
    features,
    ...(options.defaultTheme !== undefined ? { defaultTheme: options.defaultTheme } : {}),
    ...(options.defaultColors !== undefined ? { defaultColors: options.defaultColors } : {}),
    ...(options.needsToaster !== undefined ? { needsToaster: options.needsToaster } : {}),
    ...(options.dashboardRoute !== undefined ? { dashboardRoute: options.dashboardRoute } : {}),
    ...(options.navbarBrand !== undefined ? { navbarBrand: options.navbarBrand } : {}),
    ...(options.navbarLogo !== undefined ? { navbarLogo: options.navbarLogo } : {}),
    ...(options.sidebarBrand !== undefined ? { sidebarBrand: options.sidebarBrand } : {}),
    ...(options.sidebarLogo !== undefined ? { sidebarLogo: options.sidebarLogo } : {}),
  });

  const filesWritten = writeScaffoldFiles(projectDir, [file]);

  return {
    filesWritten,
    nextSteps: renderGenerateAppNextSteps({
      navbar,
      sidebar,
      footer,
      featureCount: features.length,
      filesWritten,
    }),
  };
}
