// Pure template-string builder for `quickadui generate app` — same split
// as resource-templates.ts/auth-templates.ts: this only builds a string,
// commands/generate-app.ts is the only place that touches the filesystem
// (and the only place that talks to the person, via prompts.ts).
//
// Unlike `generate resource`/`generate auth`, this writes exactly one
// file: src/App.tsx. It's meant to run *after* those two (or either of
// them), wiring navigation to whatever they already generated —
// `discover-features.ts` is what finds that. Running it with nothing
// generated yet still works: you get a shell (navbar/sidebar/footer, per
// what was asked for) around a single "Welcome" placeholder page.

import type { DiscoveredFeature } from "./discover-features.js";
import type { NavItem } from "./nav-items.js";

export type AppShellThemeMode = "light" | "dark" | "system";

/** Seed-color overrides, one `#RRGGBB` hex per family — same shape as `quickadui-config.ts`'s `QuickaduiConfigThemeColors`, this is the codegen-facing mirror of it. Passed straight through to `<ThemeProvider defaultColors={...}>`. */
export interface AppShellThemeColors {
  readonly accent?: string;
  readonly neutral?: string;
  readonly success?: string;
  readonly warning?: string;
  readonly danger?: string;
}

export interface AppShellTemplateOptions {
  /** From the target project's package.json "name", falling back to "App" — used in the navbar/sidebar brand and the footer credit line. */
  readonly projectName: string;
  readonly navbar: boolean;
  readonly sidebar: boolean;
  readonly footer: boolean;
  /** Ignored when `navbar` is false. */
  readonly navbarItems: readonly NavItem[];
  /** Ignored when `sidebar` is false. */
  readonly sidebarItems: readonly NavItem[];
  /** Text shown in the navbar's brand slot. Omit for `projectName`. Ignored (except as `navbarLogo`'s `alt` text) when `navbarLogo` is set. */
  readonly navbarBrand?: string;
  /** Path or URL to an image shown in the navbar instead of the brand text — see `quickadui-config.ts`'s `QuickaduiConfigNav.logo` doc comment. */
  readonly navbarLogo?: string;
  /** Same as `navbarBrand`, for the sidebar's header slot. */
  readonly sidebarBrand?: string;
  /** Same as `navbarLogo`, for the sidebar's header slot. */
  readonly sidebarLogo?: string;
  /** Whether `src/auth/AuthProvider.tsx` was found — wraps the tree in `<AuthProvider>` when true. */
  readonly hasAuth: boolean;
  readonly features: readonly DiscoveredFeature[];
  /** Wired into `<ThemeProvider defaultTheme={...}>` — only matters on a visitor's very first visit, before anything is stored. Omit for today's default: no `defaultTheme` prop at all, `ThemeProvider`'s own built-in default ("system") applies. */
  readonly defaultTheme?: AppShellThemeMode;
  /** Wired into `<ThemeProvider defaultColors={...}>`. Omit entirely for today's default: no `defaultColors` prop, `@quickadui/tokens`' build-time colors apply (accent is an orange). */
  readonly defaultColors?: AppShellThemeColors;
  /** Mounts `<Toaster />` (from `@quickadui/overlays`) once, high in the tree, so any generated page can call `toast(...)`. Set when at least one resource has `toasts` configured. */
  readonly needsToaster?: boolean;
  /**
   * When set, adds a router case for `<DashboardPage />` (from
   * `./pages/DashboardPage`, written by `generate-dashboard.ts`) at this
   * exact hash — e.g. `"#/"` or `"#/dashboard"`, matching
   * `quickadui-config.ts`'s `dashboard.route` (default `"#/"`). Omit
   * entirely for today's original default: no dashboard case, no import,
   * `HomePage` still answers `"#/"`. Currently only reachable via
   * `quickadui apply <config.json>` — no CLI flag for it yet, same
   * "config-only" reasoning `defaultTheme`/`needsToaster` above already
   * settled on.
   */
  readonly dashboardRoute?: string;
}

export interface RenderedApp {
  readonly path: "src/App.tsx";
  readonly contents: string;
}

/** `"..."` — a JS string literal, quote/backslash-safe. `navbarBrand`/`navbarLogo` (and their sidebar counterparts) ultimately come from a JSON config, so embedding them as raw template-string text risks a broken generated file on a value containing `"` or a backtick. Mirrors `resource-templates.ts`/`dashboard-templates.ts`'s own `jsString`, duplicated for the same "independent template modules" reason those two already are from each other. */
function jsString(value: string): string {
  return JSON.stringify(value);
}

/** The brand slot's children — an `<img>` (quote-safe `src`/`alt`) when `logo` is set, otherwise `text` as a quote-safe JS string expression (not raw JSX text, so a brand/project name containing `"`, `{`, or `<` can't break the generated file). */
function renderBrandChildren(text: string, logo: string | undefined): string {
  return logo !== undefined
    ? `<img src={${jsString(logo)}} alt={${jsString(text)}} className="h-6 w-auto" />`
    : `{${jsString(text)}}`;
}

/** Every distinct icon name (`item.icon`, without its `Icon` suffix) used by whichever of `navbarItems`/`sidebarItems` are actually rendered — i.e. only counting `sidebarItems` when `sidebar` is true, same as `buildSidebarItemsJsx`'s own caller does. Sorted, so the generated `@quickadui/icons` import line is deterministic. */
function usedIconNames(options: AppShellTemplateOptions): readonly string[] {
  const { navbar, sidebar, navbarItems, sidebarItems } = options;
  const items = [...(navbar ? navbarItems : []), ...(sidebar ? sidebarItems : [])];
  const names = new Set<string>();
  for (const item of items) {
    if (item.icon !== undefined) {
      names.add(item.icon);
    }
  }
  return [...names].sort();
}

function buildImportLines(options: AppShellTemplateOptions): string {
  const { navbar, sidebar, footer, hasAuth, features, needsToaster, dashboardRoute } = options;
  const usesShell = navbar || sidebar || footer;
  const iconNames = usedIconNames(options);

  const coreNames = hasAuth ? ["Button", "Spinner"] : ["Button"];
  const lines: string[] = [
    hasAuth
      ? 'import { type ReactNode, useEffect, useState } from "react";'
      : 'import { useEffect, useState } from "react";',
    `import { ${coreNames.join(", ")} } from "@quickadui/core";`,
  ];

  if (needsToaster) {
    lines.push('import { Toaster } from "@quickadui/overlays";');
  }

  lines.push('import { ThemeProvider, useTheme } from "@quickadui/theme";');

  if (usesShell) {
    const shellNames: string[] = ["DashboardLayout"];
    if (footer) {
      shellNames.push("Footer");
    }
    if (navbar) {
      shellNames.push("Navbar", "NavbarActions", "NavbarBrand", "NavbarContent");
    }
    if (sidebar) {
      shellNames.push(
        "Sidebar",
        "SidebarContent",
        "SidebarGroup",
        "SidebarHeader",
        "SidebarNavItem",
      );
    }
    if (navbar && sidebar) {
      shellNames.push("SidebarTrigger");
    }
    shellNames.sort();
    lines.push(
      `import {\n${shellNames.map((name) => `  ${name},`).join("\n")}\n} from "@quickadui/shell";`,
    );
  }

  if (iconNames.length > 0) {
    lines.push(
      `import {\n${iconNames.map((name) => `  ${name}Icon,`).join("\n")}\n} from "@quickadui/icons";`,
    );
  }

  if (hasAuth) {
    lines.push('import { AuthProvider, useAuth } from "./auth/AuthProvider";');
  }

  if (dashboardRoute !== undefined) {
    lines.push('import { DashboardPage } from "./pages/DashboardPage";');
  }

  for (const feature of features) {
    if (feature.kind === "resource") {
      lines.push(
        `import { ${feature.pascal}ListPage } from "./pages/${feature.kebab}/${feature.pascal}ListPage";`,
      );
      lines.push(
        `import { ${feature.pascal}FormPage } from "./pages/${feature.kebab}/${feature.pascal}FormPage";`,
      );
    } else if (feature.kind === "login") {
      lines.push('import { LoginPage } from "./pages/LoginPage";');
    } else {
      lines.push('import { ProfilePage } from "./pages/ProfilePage";');
    }
  }

  return lines.join("\n");
}

function buildRouterCases(
  features: readonly DiscoveredFeature[],
  dashboardRoute: string | undefined,
): string {
  const cases: string[] = [];

  if (dashboardRoute !== undefined) {
    cases.push(`  if (hash === "${dashboardRoute}") {
    return <DashboardPage />;
  }`);
  }

  for (const feature of features) {
    if (feature.kind === "resource") {
      const { pascal, camel, endpoint } = feature;
      cases.push(`  if (hash === "#/${endpoint}") {
    return <${pascal}ListPage />;
  }
  if (hash === "#/${endpoint}/new") {
    return <${pascal}FormPage />;
  }
  if (hash.startsWith("#/${endpoint}/") && hash.endsWith("/edit")) {
    const ${camel}Id = Number(hash.split("/")[2]);
    return <${pascal}FormPage ${camel}Id={${camel}Id} />;
  }`);
    } else if (feature.kind === "login") {
      cases.push(`  if (hash === "#/login") {
    return <LoginPage />;
  }`);
    } else {
      cases.push(`  if (hash === "#/profile") {
    return <ProfilePage />;
  }`);
    }
  }

  return cases.join("\n");
}

function buildNavButtonsJsx(items: readonly NavItem[]): string {
  return items
    .map((item) => {
      const iconJsx = item.icon !== undefined ? `<${item.icon}Icon size={16} aria-hidden />` : "";
      return `        <Button
          key="${item.href}"
          variant={hash === "${item.href}" ? "soft" : "ghost"}
          size="sm"
          asChild
        >
          <a href="${item.href}">${iconJsx}${item.label}</a>
        </Button>`;
    })
    .join("\n");
}

function buildSidebarItemsJsx(items: readonly NavItem[]): string {
  return items
    .map((item) => {
      const iconProp =
        item.icon !== undefined ? ` icon={<${item.icon}Icon size={16} aria-hidden />}` : "";
      return `          <SidebarNavItem key="${item.href}" href="${item.href}" active={hash === "${item.href}"}${iconProp}>
            ${item.label}
          </SidebarNavItem>`;
    })
    .join("\n");
}

/**
 * Generates `src/App.tsx`: a hash-based router wired to every page
 * `discover-features.ts` found, wrapped in `<ThemeProvider>` (with a
 * light/dark/system toggle button) and, if auth was generated, in
 * `<AuthProvider>` — plus an optional `Navbar`/`Sidebar`/`Footer` app shell
 * from `@quickadui/shell`, per what was asked for. Overwrites any existing
 * `src/App.tsx` — `commands/generate-app.ts` is what refuses to do that
 * without `--force`, not this function.
 */
const COLOR_FAMILY_ORDER = ["accent", "neutral", "success", "warning", "danger"] as const;

/** `<ThemeProvider>` (unchanged from before this feature existed) when neither is set, or a multi-line opening tag with `defaultTheme`/`defaultColors` props when either is. */
function buildThemeProviderOpenTag(options: AppShellTemplateOptions): string {
  const props: string[] = [];
  if (options.defaultTheme !== undefined) {
    props.push(`      defaultTheme="${options.defaultTheme}"`);
  }
  const colors = options.defaultColors;
  if (colors !== undefined) {
    const pairs = COLOR_FAMILY_ORDER.filter((family) => colors[family] !== undefined).map(
      (family) => `${family}: "${colors[family]}"`,
    );
    if (pairs.length > 0) {
      props.push(`      defaultColors={{ ${pairs.join(", ")} }}`);
    }
  }
  return props.length > 0 ? `<ThemeProvider\n${props.join("\n")}\n    >` : "<ThemeProvider>";
}

export function renderApp(options: AppShellTemplateOptions): RenderedApp {
  const { projectName, navbar, sidebar, footer, navbarItems, sidebarItems, hasAuth, features } =
    options;
  const usesShell = navbar || sidebar || footer;
  const navbarBrandChildren = renderBrandChildren(
    options.navbarBrand ?? projectName,
    options.navbarLogo,
  );
  const sidebarBrandChildren = renderBrandChildren(
    options.sidebarBrand ?? projectName,
    options.sidebarLogo,
  );
  const routerCases = buildRouterCases(features, options.dashboardRoute);
  const themeProviderOpenTag = buildThemeProviderOpenTag(options);
  const toasterJsx = options.needsToaster ? "\n      <Toaster />" : "";

  const themeToggleRow = `        <div className="flex justify-end p-2">
          <ThemeToggle />
        </div>\n`;

  const bodyChildren = navbar
    ? "<Router hash={hash} />"
    : `<>\n${themeToggleRow}        <Router hash={hash} />\n      </>`;

  const appNavbarFn = navbar
    ? `
function AppNavbar({ hash }: { hash: string }) {
  return (
    <Navbar>
      <NavbarBrand>
${sidebar ? "        <SidebarTrigger />\n" : ""}        ${navbarBrandChildren}
      </NavbarBrand>
      <NavbarContent>
${buildNavButtonsJsx(navbarItems)}
      </NavbarContent>
      <NavbarActions>
        <ThemeToggle />
      </NavbarActions>
    </Navbar>
  );
}
`
    : "";

  const appSidebarFn = sidebar
    ? `
function AppSidebar({ hash }: { hash: string }) {
  return (
    <Sidebar>
      <SidebarHeader>${sidebarBrandChildren}</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
${buildSidebarItemsJsx(sidebarItems)}
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
`
    : "";

  const appFooterFn = footer
    ? `
function AppFooter() {
  return (
    <Footer>
      <span>
        © {new Date().getFullYear()} ${projectName}
      </span>
    </Footer>
  );
}
`
    : "";

  const dashboardLayoutProps = [
    navbar ? "      navbar={<AppNavbar hash={hash} />}" : undefined,
    sidebar ? "      sidebar={<AppSidebar hash={hash} />}" : undefined,
    footer ? "      footer={<AppFooter />}" : undefined,
  ]
    .filter((line): line is string => line !== undefined)
    .join("\n");

  const content = usesShell
    ? `(
    <DashboardLayout
${dashboardLayoutProps}
    >
      ${bodyChildren}
    </DashboardLayout>
  )`
    : `(
    <div className="p-4">
      ${bodyChildren}
    </div>
  )`;

  const contents = `${buildImportLines(options)}

// Generated by \`quickadui generate app\`. This file is yours from here on
// — edit it freely. Re-running the same command overwrites it (only with
// --force; see the CLI's README), so keep any hand-written changes in mind
// before regenerating. Routing is a plain hash switch, same as every other
// generated page's links ("#/products/new", etc.) — swap in a real router
// (React Router, TanStack Router, ...) whenever you outgrow this.

function useHashRoute(): string {
  const [hash, setHash] = useState(window.location.hash || "#/");
  useEffect(() => {
    const onChange = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash;
}

const THEME_LABELS: Record<"light" | "dark" | "system", string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};
const THEME_CYCLE = ["system", "light", "dark"] as const;

/** Cycles system -> light -> dark -> system on click. Reads/writes mode via \`@quickadui/theme\`'s useTheme() — the actual light/dark CSS is theme's job, not this component's. */
function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  function cycle() {
    const nextIndex = (THEME_CYCLE.indexOf(theme) + 1) % THEME_CYCLE.length;
    setTheme(THEME_CYCLE[nextIndex] ?? "system");
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={cycle}>
      {theme === "system" ? \`System (\${resolvedTheme})\` : THEME_LABELS[theme]}
    </Button>
  );
}

function HomePage() {
  return (
    <div className="flex flex-col gap-2 p-6">
      <h1 className="text-lg font-semibold text-neutral-12">Welcome to ${projectName}</h1>
      <p className="text-sm text-neutral-11">
        Generated by \`quickadui generate app\`. Run \`quickadui generate resource\`/\`generate auth\` and
        then \`quickadui generate app\` again to wire up their pages here automatically.
      </p>
    </div>
  );
}

function Router({ hash }: { hash: string }) {
${routerCases ? `${routerCases}\n` : ""}  return <HomePage />;
}
${appNavbarFn}${appSidebarFn}${appFooterFn}${
  hasAuth
    ? `
/**
 * Shows a centered Spinner in place of \`children\` while AuthProvider
 * runs its initial "am I already signed in" check (useAuth().loading),
 * instead of a flash of logged-out content on every page load/refresh.
 * Renders instantly once that check settles either way — signed in or
 * not — same as before this existed.
 */
function AuthGate({ children }: { children: ReactNode }) {
  const { loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" label="Loading" />
      </div>
    );
  }
  return <>{children}</>;
}
`
    : ""
}
export function App() {
  const hash = useHashRoute();
  const content = ${content};

  return (
    ${themeProviderOpenTag}${
      hasAuth
        ? `
      <AuthProvider>
        <AuthGate>{content}</AuthGate>
      </AuthProvider>${toasterJsx}
    </ThemeProvider>
  );`
        : `
      {content}${toasterJsx}
    </ThemeProvider>
  );`
    }
}
`;

  return { path: "src/App.tsx", contents };
}
