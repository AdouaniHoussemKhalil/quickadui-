// The CLI's package registry.
//
// This is a hand-maintained mirror of the monorepo's real
// `packages/*/package.json` files — every version range and dependency
// listed below was copied from the actual file, not guessed. It only
// covers the packages meant to be installed into a *consumer's* app via
// `quickadui add`: `@quickadui/config` is monorepo-internal dev tooling
// (a shared tsconfig/Biome/Tailwind preset for QuickadUI's own packages)
// and isn't something an external project adds at runtime, so it's
// deliberately left out of this registry.
//
// Every version range below was verified against the real npm registry,
// not assumed. As of 2026-09-23, `core`/`data`/`forms`/`primitives`/`theme`
// are at 0.2.0 (new components: Collapsible, CopyButton/CopyField,
// SortableList, PasswordInput, Input startIcon/endIcon, scrollbar.css) and
// `layout`/`overlays` are at 0.1.1 (patch bump from their internal
// dependency on the packages above, per `updateInternalDependencies:
// "patch"` in .changeset/config.json). Everything else is still at 0.1.0,
// the original 2026-09-17 release. Update this file again whenever a new
// minor/major ships — a stale range here silently installs old code even
// once npm itself is current.

export interface ExternalDependency {
  readonly name: string;
  readonly range: string;
}

export interface QuickaduiPackageDefinition {
  /** The npm package name, e.g. "@quickadui/core". */
  readonly name: string;
  /** The version range to record in the consumer's package.json. */
  readonly version: string;
  readonly description: string;
  /**
   * Names of other QuickadUI packages this one depends on (matching this
   * same registry's `name` field) — what `add` walks to install the full
   * dependency closure, not just the package the user asked for.
   */
  readonly quickaduiDependencies: readonly string[];
  /** Non-QuickadUI runtime dependencies, with their real declared ranges. */
  readonly externalDependencies: readonly ExternalDependency[];
  /**
   * Whether a consumer needs a Tailwind `@source "./node_modules/<name>";`
   * line for this package's own hardcoded utility classes to survive
   * Tailwind's content scan once pnpm/npm symlinks or copies it into
   * node_modules. Packages that only export logic, tokens, or hooks (no
   * component with a hardcoded className) don't need one.
   */
  readonly needsSourceDirective: boolean;
}

const REACT_PEER_DEPENDENCIES: readonly ExternalDependency[] = [
  { name: "react", range: ">=18" },
  { name: "react-dom", range: ">=18" },
];

export const QUICKADUI_PACKAGES: readonly QuickaduiPackageDefinition[] = [
  {
    name: "@quickadui/tokens",
    version: "^0.1.0",
    description: "Design tokens — the single source of truth for color, space, type and motion.",
    quickaduiDependencies: [],
    externalDependencies: [],
    needsSourceDirective: false,
  },
  {
    name: "@quickadui/utils",
    version: "^0.1.0",
    description: "cn(), formatters, and shared type helpers used across every other package.",
    quickaduiDependencies: [],
    externalDependencies: [
      { name: "clsx", range: "^2.1.0" },
      { name: "tailwind-merge", range: "^3.6.0" },
    ],
    needsSourceDirective: false,
  },
  {
    name: "@quickadui/hooks",
    version: "^0.1.0",
    description:
      "Framework-agnostic utility hooks (useDisclosure, useMediaQuery, useDebounce, and friends).",
    quickaduiDependencies: [],
    externalDependencies: [],
    needsSourceDirective: false,
  },
  {
    name: "@quickadui/theme",
    version: "^0.2.0",
    description: "ThemeProvider, the CSS-variable engine, and the Tailwind v4 @theme integration.",
    quickaduiDependencies: ["@quickadui/tokens"],
    externalDependencies: [],
    needsSourceDirective: false,
  },
  {
    name: "@quickadui/icons",
    version: "^0.1.0",
    description:
      "Wrapped Lucide icons behind one stable Icon contract; QuickadUI-original glyphs land incrementally.",
    quickaduiDependencies: [],
    externalDependencies: [{ name: "lucide-react", range: "^1.46.0" }],
    needsSourceDirective: false,
  },
  {
    name: "@quickadui/primitives",
    version: "^0.2.0",
    description: "Unstyled behavior primitives. The only package that imports Radix UI directly.",
    quickaduiDependencies: [],
    externalDependencies: [{ name: "radix-ui", range: "^1.6.0" }],
    needsSourceDirective: true,
  },
  {
    name: "@quickadui/core",
    version: "^0.2.0",
    description:
      "Core components — Button, IconButton, Card, Badge, Avatar, Alert, Spinner, Skeleton, Typography.",
    quickaduiDependencies: ["@quickadui/primitives", "@quickadui/utils"],
    externalDependencies: [{ name: "class-variance-authority", range: "^0.7.0" }],
    needsSourceDirective: true,
  },
  {
    name: "@quickadui/layout",
    version: "^0.1.1",
    description: "Layout building blocks — Grid, Flex, Stack, Container, Section, Page Container.",
    quickaduiDependencies: ["@quickadui/theme", "@quickadui/utils"],
    externalDependencies: [
      { name: "class-variance-authority", range: "^0.7.0" },
      { name: "clsx", range: "^2.1.0" },
      { name: "tailwind-merge", range: "^2.5.0" },
    ],
    needsSourceDirective: true,
  },
  {
    name: "@quickadui/overlays",
    version: "^0.1.1",
    description: "Modal, Drawer — Context Menu and Toast/Notification land incrementally.",
    quickaduiDependencies: [
      "@quickadui/icons",
      "@quickadui/primitives",
      "@quickadui/theme",
      "@quickadui/utils",
    ],
    externalDependencies: [{ name: "class-variance-authority", range: "^0.7.0" }],
    needsSourceDirective: true,
  },
  {
    name: "@quickadui/data",
    version: "^0.2.0",
    description: "Table, Pagination, Timeline, Tree View, and Stepper.",
    quickaduiDependencies: ["@quickadui/icons", "@quickadui/theme", "@quickadui/utils"],
    externalDependencies: [{ name: "class-variance-authority", range: "^0.7.0" }],
    needsSourceDirective: true,
  },
  {
    name: "@quickadui/forms",
    version: "^0.2.0",
    description: "Form field components plus a React Hook Form + Zod bindings layer.",
    quickaduiDependencies: [
      "@quickadui/icons",
      "@quickadui/primitives",
      "@quickadui/theme",
      "@quickadui/utils",
    ],
    externalDependencies: [
      { name: "react-hook-form", range: "^7.88.0" },
      { name: "@hookform/resolvers", range: "^5.9.1" },
      { name: "class-variance-authority", range: "^0.7.0" },
      { name: "zod", range: "^3.25.0 || ^4.0.0" },
    ],
    needsSourceDirective: true,
  },
  {
    name: "@quickadui/shell",
    version: "^0.1.0",
    description:
      "Navbar, collapsible Sidebar, Footer, DashboardLayout, and a drag-and-drop WidgetGrid/Widget pair for an admin/dashboard app frame.",
    quickaduiDependencies: ["@quickadui/icons", "@quickadui/utils"],
    externalDependencies: [
      { name: "class-variance-authority", range: "^0.7.0" },
      { name: "@dnd-kit/core", range: "^6.3.1" },
      { name: "@dnd-kit/sortable", range: "^10.0.0" },
      { name: "@dnd-kit/utilities", range: "^3.2.2" },
    ],
    needsSourceDirective: true,
  },
  {
    name: "@quickadui/charts",
    version: "^0.1.0",
    description:
      "Ready-to-use dashboard stat/chart components — StatCard, Sparkline, BarChart, LineChart, DonutChart — hand-rolled SVG, zero chart-library dependency. Pairs with @quickadui/shell's Widget/WidgetGrid but doesn't depend on it.",
    quickaduiDependencies: ["@quickadui/icons", "@quickadui/utils"],
    externalDependencies: [],
    needsSourceDirective: true,
  },
  {
    name: "@quickadui/animation",
    version: "^0.1.0",
    description: "Motion presets, reusable animation variants, and a Reveal convenience component.",
    quickaduiDependencies: [],
    externalDependencies: [{ name: "motion", range: "^13.4.0" }],
    needsSourceDirective: false,
  },
].map((pkg) => ({
  ...pkg,
  externalDependencies: [...pkg.externalDependencies, ...REACT_PEER_DEPENDENCIES],
}));

export function findPackage(name: string): QuickaduiPackageDefinition | undefined {
  return QUICKADUI_PACKAGES.find((pkg) => pkg.name === name || pkg.name === `@quickadui/${name}`);
}

/**
 * Resolves a list of requested package names to the full, de-duplicated
 * set of QuickadUI packages that need to be installed — the requested
 * packages plus every QuickadUI package they transitively depend on.
 *
 * Order is deterministic: a dependency always appears before the package
 * that needs it, so printing the result in order (e.g. in package.json or
 * in the "next steps" summary) reads as a sensible install order. Throws
 * if any requested name isn't in the registry, naming the bad input.
 */
export function resolveDependencyClosure(names: readonly string[]): QuickaduiPackageDefinition[] {
  const resolved: QuickaduiPackageDefinition[] = [];
  const seen = new Set<string>();

  function visit(name: string): void {
    const pkg = findPackage(name);
    if (!pkg) {
      throw new Error(`Unknown QuickadUI package: "${name}".`);
    }
    if (seen.has(pkg.name)) {
      return;
    }
    seen.add(pkg.name);
    for (const dependencyName of pkg.quickaduiDependencies) {
      visit(dependencyName);
    }
    resolved.push(pkg);
  }

  for (const name of names) {
    visit(name);
  }

  return resolved;
}
