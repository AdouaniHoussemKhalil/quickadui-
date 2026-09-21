import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runApply } from "./apply";

let projectDir: string | undefined;
let configDir: string | undefined;

afterEach(() => {
  if (projectDir) {
    rmSync(projectDir, { recursive: true, force: true });
    projectDir = undefined;
  }
  if (configDir) {
    rmSync(configDir, { recursive: true, force: true });
    configDir = undefined;
  }
});

/** A project directory that already has `quickadui init` behind it — just enough of a package.json for `runAdd` to read and rewrite, matching `check-prerequisites.test.ts`'s own fixture shape. */
function makeInitializedProject(): string {
  const dir = mkdtempSync(join(tmpdir(), "quickadui-apply-test-project-"));
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "test-app", dependencies: {} }), "utf8");
  projectDir = dir;
  return dir;
}

function writeConfigFile(raw: unknown): string {
  const dir = mkdtempSync(join(tmpdir(), "quickadui-apply-test-config-"));
  configDir = dir;
  const path = join(dir, "quickadui.config.json");
  writeFileSync(path, JSON.stringify(raw), "utf8");
  return path;
}

function minimalConfig() {
  return {
    resources: [
      {
        name: "product",
        fields: [
          { name: "title", type: "string" },
          { name: "price", type: "number" },
        ],
      },
    ],
  };
}

describe("runApply — happy path", () => {
  it("adds the packages a minimal config needs, generates the resource, and generates the app shell", async () => {
    const dir = makeInitializedProject();
    const configPath = writeConfigFile(minimalConfig());

    const result = await runApply({ projectDir: dir, configPath, packageManager: "npm", force: false });

    const installedNames = result.addResult.installedPackages.map((pkg) => pkg.name);
    expect(installedNames).toContain("@quickadui/core");
    expect(installedNames).toContain("@quickadui/theme");
    expect(installedNames).toContain("@quickadui/data");
    expect(installedNames).toContain("@quickadui/forms");

    expect(result.resourceResults).toHaveLength(1);
    expect(result.resourceResults[0]?.name).toBe("product");
    expect(result.resourceResults[0]?.result.filesWritten.length).toBeGreaterThan(0);

    expect(result.authResult).toBeUndefined();
    expect(result.appResult.filesWritten).toContain("src/App.tsx");

    expect(result.warnings).toHaveLength(0);
    expect(result.nextSteps).toContain("app shell");
  });

  it("also adds forms and generates auth when auth.enabled is true", async () => {
    const dir = makeInitializedProject();
    const configPath = writeConfigFile({ ...minimalConfig(), auth: { enabled: true } });

    const result = await runApply({ projectDir: dir, configPath, packageManager: "npm", force: false });

    expect(result.authResult).toBeDefined();
    expect(result.authResult?.filesWritten.length).toBeGreaterThan(0);
    expect(result.nextSteps).toContain("--- auth ---");
  });

  it("adds shell by default (generate app defaults navbar/footer on), but not when navbar/sidebar/footer are all explicitly disabled", async () => {
    // No navbar/sidebar/footer section at all: `generate app` (called
    // with assumeYes: true below) still defaults navbar/footer to *on* —
    // see requiredPackagesFor's own comment — so shell is still needed.
    const dirDefault = makeInitializedProject();
    const withDefaultShell = await runApply({
      projectDir: dirDefault,
      configPath: writeConfigFile(minimalConfig()),
      packageManager: "npm",
      force: false,
    });
    expect(withDefaultShell.addResult.installedPackages.map((p) => p.name)).toContain("@quickadui/shell");

    const dirNone = makeInitializedProject();
    const withoutShell = await runApply({
      projectDir: dirNone,
      configPath: writeConfigFile({
        ...minimalConfig(),
        navbar: { enabled: false },
        sidebar: { enabled: false },
        footer: { enabled: false },
      }),
      packageManager: "npm",
      force: false,
    });
    expect(withoutShell.addResult.installedPackages.map((p) => p.name)).not.toContain("@quickadui/shell");
  });

  it("passes custom navbar items through to generate app", async () => {
    const dir = makeInitializedProject();
    const configPath = writeConfigFile({
      ...minimalConfig(),
      navbar: { enabled: true, items: [{ label: "Home", href: "#/" }] },
    });

    const result = await runApply({ projectDir: dir, configPath, packageManager: "npm", force: false });
    expect(result.appResult.filesWritten).toContain("src/App.tsx");
  });

  it("carries a navbar item's icon through to the generated src/App.tsx", async () => {
    const dir = makeInitializedProject();
    const configPath = writeConfigFile({
      ...minimalConfig(),
      navbar: { enabled: true, items: [{ label: "Home", href: "#/", icon: "Home" }] },
    });

    const result = await runApply({ projectDir: dir, configPath, packageManager: "npm", force: false });
    const appTsx = readFileSync(join(dir, "src", "App.tsx"), "utf8");
    expect(appTsx).toContain('import {\n  HomeIcon,\n} from "@quickadui/icons";');
    expect(appTsx).toContain("<HomeIcon size={16} aria-hidden />Home");
    expect(result.addResult.installedPackages.map((p) => p.name)).toContain("@quickadui/icons");
  });

  it("carries a resource's buttonIcons through to its generated list/form pages", async () => {
    const dir = makeInitializedProject();
    const configPath = writeConfigFile({
      resources: [
        {
          name: "product",
          fields: [{ name: "title", type: "string" }],
          buttonIcons: { create: "Plus", delete: "Trash", save: "Check" },
        },
      ],
    });

    const result = await runApply({ projectDir: dir, configPath, packageManager: "npm", force: false });
    expect(result.resourceResults[0]?.result.filesWritten.length).toBeGreaterThan(0);

    const listPage = readFileSync(join(dir, "src", "pages", "product", "ProductListPage.tsx"), "utf8");
    expect(listPage).toContain("<PlusIcon size={16} aria-hidden />New product");
    expect(listPage).toContain("icon={<TrashIcon size={16} aria-hidden />}");

    const formPage = readFileSync(join(dir, "src", "pages", "product", "ProductFormPage.tsx"), "utf8");
    expect(formPage).toContain("icon={<CheckIcon size={16} aria-hidden />}");
  });

  it("doesn't add @quickadui/icons on its own account when no rendered nav item has an icon", async () => {
    // @quickadui/shell, @quickadui/data, and @quickadui/forms all
    // transitively depend on @quickadui/icons themselves (MenuIcon for
    // SidebarTrigger; icons used inside data/forms components) — so with
    // any resource, or shell, installed (the default), icons is always
    // present regardless of this feature. Isolating whether *this* logic
    // (rendersAnyIcon in requiredPackagesFor) adds it on its own needs a
    // config with no resources, no auth, and navbar/sidebar/footer all
    // explicitly off — none of core/theme (the only packages always
    // added) depend on icons.
    const dir = makeInitializedProject();
    const configPath = writeConfigFile({
      resources: [],
      navbar: { enabled: false },
      sidebar: { enabled: false },
      footer: { enabled: false },
    });
    const result = await runApply({ projectDir: dir, configPath, packageManager: "npm", force: false });
    expect(result.addResult.installedPackages.map((p) => p.name)).not.toContain("@quickadui/icons");
  });
});

describe("runApply — warnings for validated-but-not-yet-generated sections", () => {
  it("warns about per-view fields/actions", async () => {
    const dir = makeInitializedProject();
    const configPath = writeConfigFile({
      resources: [
        {
          name: "product",
          fields: [{ name: "title", type: "string" }],
          views: { list: { fields: ["title"] } },
        },
      ],
    });
    const result = await runApply({ projectDir: dir, configPath, packageManager: "npm", force: false });
    expect(result.warnings.some((w) => w.includes("resources[].views"))).toBe(true);
  });

  it("warns about role/requiresAuth gating on nav items", async () => {
    const dir = makeInitializedProject();
    const configPath = writeConfigFile({
      ...minimalConfig(),
      auth: { enabled: true, roles: ["admin"] },
      navbar: { enabled: true, items: [{ label: "Admin", href: "#/admin", role: ["admin"] }] },
    });
    const result = await runApply({ projectDir: dir, configPath, packageManager: "npm", force: false });
    expect(result.warnings.some((w) => w.includes("requiresAuth"))).toBe(true);
  });

  it("warns about footer.content", async () => {
    const dir = makeInitializedProject();
    const configPath = writeConfigFile({ ...minimalConfig(), footer: { enabled: true, content: "Hi" } });
    const result = await runApply({ projectDir: dir, configPath, packageManager: "npm", force: false });
    expect(result.warnings.some((w) => w.includes("footer.content"))).toBe(true);
  });

  it("has no warnings for a config that only uses generated-today features", async () => {
    const dir = makeInitializedProject();
    const configPath = writeConfigFile(minimalConfig());
    const result = await runApply({ projectDir: dir, configPath, packageManager: "npm", force: false });
    expect(result.warnings).toHaveLength(0);
  });
});

describe("runApply — theme", () => {
  it("wires theme.default and theme.colors into the generated App.tsx's ThemeProvider, with no warning", async () => {
    const dir = makeInitializedProject();
    const configPath = writeConfigFile({
      ...minimalConfig(),
      theme: { default: "dark", colors: { accent: "#2563EB" } },
    });
    const result = await runApply({ projectDir: dir, configPath, packageManager: "npm", force: false });

    const appTsx = readFileSync(join(dir, "src", "App.tsx"), "utf8");
    expect(appTsx).toContain('<ThemeProvider\n      defaultTheme="dark"\n      defaultColors={{ accent: "#2563EB" }}\n    >');
    expect(result.warnings.some((w) => w.includes("theme.default"))).toBe(false);
  });

  it("leaves App.tsx's <ThemeProvider> unchanged when theme is unset", async () => {
    const dir = makeInitializedProject();
    const configPath = writeConfigFile(minimalConfig());
    await runApply({ projectDir: dir, configPath, packageManager: "npm", force: false });

    const appTsx = readFileSync(join(dir, "src", "App.tsx"), "utf8");
    expect(appTsx).toContain("<ThemeProvider>");
    expect(appTsx).not.toContain("defaultTheme=");
    expect(appTsx).not.toContain("defaultColors=");
  });
});

describe("runApply — toasts", () => {
  it("wires a resource's toasts into its generated pages, installs @quickadui/overlays, and mounts <Toaster />", async () => {
    const dir = makeInitializedProject();
    const configPath = writeConfigFile({
      resources: [
        {
          name: "product",
          fields: [{ name: "title", type: "string" }],
          toasts: { deleteSuccess: "Product removed." },
        },
      ],
    });
    const result = await runApply({ projectDir: dir, configPath, packageManager: "npm", force: false });

    expect(result.addResult.installedPackages.map((p) => p.name)).toContain("@quickadui/overlays");

    const listPage = readFileSync(join(dir, "src", "pages", "product", "ProductListPage.tsx"), "utf8");
    expect(listPage).toContain('import { toast } from "@quickadui/overlays";');
    expect(listPage).toContain('toast({ title: "Product removed.", variant: "success" });');

    const appTsx = readFileSync(join(dir, "src", "App.tsx"), "utf8");
    expect(appTsx).toContain('import { Toaster } from "@quickadui/overlays";');
    expect(appTsx).toContain("<Toaster />");
  });

  it("doesn't install @quickadui/overlays or mount <Toaster /> when no resource has toasts", async () => {
    const dir = makeInitializedProject();
    const configPath = writeConfigFile(minimalConfig());
    const result = await runApply({ projectDir: dir, configPath, packageManager: "npm", force: false });

    expect(result.addResult.installedPackages.map((p) => p.name)).not.toContain("@quickadui/overlays");
    const appTsx = readFileSync(join(dir, "src", "App.tsx"), "utf8");
    expect(appTsx).not.toContain("Toaster");
  });
});

describe("runApply — confirmDelete", () => {
  it("wires confirmDelete: true into the generated list page's confirm Modal and installs @quickadui/overlays", async () => {
    const dir = makeInitializedProject();
    const configPath = writeConfigFile({
      resources: [
        {
          name: "product",
          fields: [{ name: "title", type: "string" }],
          confirmDelete: true,
        },
      ],
    });
    const result = await runApply({ projectDir: dir, configPath, packageManager: "npm", force: false });

    expect(result.addResult.installedPackages.map((p) => p.name)).toContain("@quickadui/overlays");
    const listPage = readFileSync(join(dir, "src", "pages", "product", "ProductListPage.tsx"), "utf8");
    expect(listPage).toContain("<Modal");
    expect(listPage).toContain("setPendingDeleteId(item.id)");
  });

  it("uses a custom confirmDelete string as the Modal's message", async () => {
    const dir = makeInitializedProject();
    const configPath = writeConfigFile({
      resources: [
        {
          name: "product",
          fields: [{ name: "title", type: "string" }],
          confirmDelete: "Really delete this product?",
        },
      ],
    });
    await runApply({ projectDir: dir, configPath, packageManager: "npm", force: false });

    const listPage = readFileSync(join(dir, "src", "pages", "product", "ProductListPage.tsx"), "utf8");
    expect(listPage).toContain("Really delete this product?");
  });

  it("installs @quickadui/overlays only once when a resource uses both toasts and confirmDelete", async () => {
    const dir = makeInitializedProject();
    const configPath = writeConfigFile({
      resources: [
        {
          name: "product",
          fields: [{ name: "title", type: "string" }],
          toasts: { deleteSuccess: "Gone." },
          confirmDelete: true,
        },
      ],
    });
    const result = await runApply({ projectDir: dir, configPath, packageManager: "npm", force: false });

    const overlaysCount = result.addResult.installedPackages.filter((p) => p.name === "@quickadui/overlays").length;
    expect(overlaysCount).toBe(1);
  });
});

describe("runApply — dashboard", () => {
  it("generates nothing dashboard-related, and dashboardResult stays undefined, when dashboard is unset", async () => {
    const dir = makeInitializedProject();
    const configPath = writeConfigFile(minimalConfig());
    const result = await runApply({ projectDir: dir, configPath, packageManager: "npm", force: false });

    expect(result.dashboardResult).toBeUndefined();
    expect(result.resourceResults[0]?.result.filesWritten).not.toContain("src/pages/DashboardPage.tsx");
    const appTsx = readFileSync(join(dir, "src", "App.tsx"), "utf8");
    expect(appTsx).not.toContain("DashboardPage");
    expect(result.addResult.installedPackages.map((p) => p.name)).not.toContain("@quickadui/charts");
  });

  it("generates a placeholder DashboardPage, with no shell/charts installed, when enabled with no widgets", async () => {
    const dir = makeInitializedProject();
    const configPath = writeConfigFile({ ...minimalConfig(), dashboard: { enabled: true } });
    const result = await runApply({ projectDir: dir, configPath, packageManager: "npm", force: false });

    expect(result.dashboardResult).toBeDefined();
    expect(result.dashboardResult?.filesWritten).toContain("src/pages/DashboardPage.tsx");
    const dashboardTsx = readFileSync(join(dir, "src", "pages", "DashboardPage.tsx"), "utf8");
    expect(dashboardTsx).toContain("No widgets configured yet");

    const appTsx = readFileSync(join(dir, "src", "App.tsx"), "utf8");
    expect(appTsx).toContain('import { DashboardPage } from "./pages/DashboardPage";');
    expect(appTsx).toContain('if (hash === "#/") {\n    return <DashboardPage />;\n  }');
  });

  it("wires a stat widget end to end: StatCard, @quickadui/shell + @quickadui/charts installed", async () => {
    const dir = makeInitializedProject();
    const configPath = writeConfigFile({
      resources: [{ name: "product", fields: [{ name: "title", type: "string" }] }],
      dashboard: {
        enabled: true,
        widgets: [{ id: "products-count", type: "stat", title: "Products", resource: "product" }],
      },
    });
    const result = await runApply({ projectDir: dir, configPath, packageManager: "npm", force: false });

    const installedNames = result.addResult.installedPackages.map((p) => p.name);
    expect(installedNames).toContain("@quickadui/shell");
    expect(installedNames).toContain("@quickadui/charts");

    const dashboardTsx = readFileSync(join(dir, "src", "pages", "DashboardPage.tsx"), "utf8");
    expect(dashboardTsx).toContain('import { StatCard } from "@quickadui/charts";');
    expect(dashboardTsx).toContain('import { listProducts } from "../api/product.api";');
    expect(dashboardTsx).toContain("listProducts({ limit: 1 })");
  });

  it("wires a list widget end to end, using the resource's first field as the row label, without requiring @quickadui/charts", async () => {
    const dir = makeInitializedProject();
    const configPath = writeConfigFile({
      resources: [
        {
          name: "product",
          fields: [
            { name: "title", type: "string" },
            { name: "price", type: "number" },
          ],
        },
      ],
      dashboard: {
        enabled: true,
        widgets: [{ id: "recent-products", type: "list", title: "Recent products", resource: "product" }],
      },
    });
    const result = await runApply({ projectDir: dir, configPath, packageManager: "npm", force: false });

    const installedNames = result.addResult.installedPackages.map((p) => p.name);
    expect(installedNames).toContain("@quickadui/shell");
    expect(installedNames).not.toContain("@quickadui/charts");

    const dashboardTsx = readFileSync(join(dir, "src", "pages", "DashboardPage.tsx"), "utf8");
    expect(dashboardTsx).toContain("{String(item.title)}");
  });

  it("resolves a widget's resource endpoint from the resource's own explicit endpoint override, not the naive plural default", async () => {
    const dir = makeInitializedProject();
    const configPath = writeConfigFile({
      resources: [
        { name: "category", endpoint: "product-categories", fields: [{ name: "name", type: "string" }] },
      ],
      dashboard: {
        enabled: true,
        widgets: [{ id: "categories-count", type: "stat", title: "Categories", resource: "category" }],
      },
    });
    await runApply({ projectDir: dir, configPath, packageManager: "npm", force: false });

    const dashboardTsx = readFileSync(join(dir, "src", "pages", "DashboardPage.tsx"), "utf8");
    // The stat widget's own list<Plural>() call doesn't reference the
    // endpoint string directly (only .total matters for "stat"), but the
    // api import path is derived from the resource's own kebab type name
    // regardless of its endpoint override — this asserts the resolver
    // picked up the right resource at all rather than silently resolving
    // to some other one.
    expect(dashboardTsx).toContain('import { listCategories } from "../api/category.api";');
  });

  it("uses a custom dashboard.route instead of the default #/", async () => {
    const dir = makeInitializedProject();
    const configPath = writeConfigFile({
      ...minimalConfig(),
      dashboard: { enabled: true, route: "#/dashboard" },
    });
    await runApply({ projectDir: dir, configPath, packageManager: "npm", force: false });

    const appTsx = readFileSync(join(dir, "src", "App.tsx"), "utf8");
    expect(appTsx).toContain('if (hash === "#/dashboard") {\n    return <DashboardPage />;\n  }');
  });

  it("passes dashboard.columns through to the generated WidgetGrid", async () => {
    const dir = makeInitializedProject();
    const configPath = writeConfigFile({
      resources: [{ name: "product", fields: [{ name: "title", type: "string" }] }],
      dashboard: {
        enabled: true,
        columns: 2,
        widgets: [{ id: "products-count", type: "stat", title: "Products", resource: "product" }],
      },
    });
    await runApply({ projectDir: dir, configPath, packageManager: "npm", force: false });

    const dashboardTsx = readFileSync(join(dir, "src", "pages", "DashboardPage.tsx"), "utf8");
    expect(dashboardTsx).toContain("columns={2}");
  });

  it("includes a --- dashboard --- section in nextSteps only when dashboard is enabled", async () => {
    const dirEnabled = makeInitializedProject();
    const enabled = await runApply({
      projectDir: dirEnabled,
      configPath: writeConfigFile({ ...minimalConfig(), dashboard: { enabled: true } }),
      packageManager: "npm",
      force: false,
    });
    expect(enabled.nextSteps).toContain("--- dashboard ---");

    const dirDisabled = makeInitializedProject();
    const disabled = await runApply({
      projectDir: dirDisabled,
      configPath: writeConfigFile(minimalConfig()),
      packageManager: "npm",
      force: false,
    });
    expect(disabled.nextSteps).not.toContain("--- dashboard ---");
  });

  it("auto-adds a Dashboard navbar/sidebar link when dashboard is enabled and navbar/sidebar items are left to their default", async () => {
    const dir = makeInitializedProject();
    const configPath = writeConfigFile({
      resources: [{ name: "product", fields: [{ name: "title", type: "string" }] }],
      dashboard: {
        enabled: true,
        widgets: [{ id: "products-count", type: "stat", title: "Products", resource: "product" }],
      },
      sidebar: { enabled: true },
    });
    await runApply({ projectDir: dir, configPath, packageManager: "npm", force: false });

    const appTsx = readFileSync(join(dir, "src", "App.tsx"), "utf8");
    // Same "first item" placement app-shell-templates.ts already renders
    // navbar/sidebar items in — asserts the Dashboard link exists and
    // precedes the auto-detected "Products" link, not just that both
    // exist somewhere in the file.
    expect(appTsx.indexOf('href="#/">Dashboard')).toBeGreaterThan(-1);
    expect(appTsx.indexOf("Products")).toBeGreaterThan(appTsx.indexOf('href="#/">Dashboard'));
  });

  it("does not force a Dashboard link into an explicit navbar.items list — the config's own items win", async () => {
    const dir = makeInitializedProject();
    const configPath = writeConfigFile({
      resources: [{ name: "product", fields: [{ name: "title", type: "string" }] }],
      dashboard: {
        enabled: true,
        widgets: [{ id: "products-count", type: "stat", title: "Products", resource: "product" }],
      },
      navbar: { enabled: true, items: [{ label: "Products", href: "#/products" }] },
    });
    await runApply({ projectDir: dir, configPath, packageManager: "npm", force: false });

    const appTsx = readFileSync(join(dir, "src", "App.tsx"), "utf8");
    expect(appTsx).not.toContain(">Dashboard<");
  });
});

describe("runApply — error paths", () => {
  it("throws a clear error when the config file doesn't exist", async () => {
    const dir = makeInitializedProject();
    await expect(runApply({ projectDir: dir, configPath: "/no/such/file.json", packageManager: "npm", force: false })).rejects.toThrow(
      /No config file found/,
    );
  });

  it("throws a clear error when the config file isn't valid JSON", async () => {
    const dir = makeInitializedProject();
    const cfgDir = mkdtempSync(join(tmpdir(), "quickadui-apply-test-config-"));
    configDir = cfgDir;
    const path = join(cfgDir, "bad.json");
    writeFileSync(path, "{ not json", "utf8");
    await expect(runApply({ projectDir: dir, configPath: path, packageManager: "npm", force: false })).rejects.toThrow(
      /isn't valid JSON/,
    );
  });

  it("throws parseQuickaduiConfig's own error when the config is structurally invalid", async () => {
    const dir = makeInitializedProject();
    const configPath = writeConfigFile({ resources: "not an array" });
    await expect(runApply({ projectDir: dir, configPath, packageManager: "npm", force: false })).rejects.toThrow(
      /Invalid quickadui config/,
    );
  });

  it("throws when the project hasn't been initialized (no package.json)", async () => {
    const dir = mkdtempSync(join(tmpdir(), "quickadui-apply-test-project-"));
    projectDir = dir;
    const configPath = writeConfigFile(minimalConfig());
    await expect(runApply({ projectDir: dir, configPath, packageManager: "npm", force: false })).rejects.toThrow(
      /No package\.json found/,
    );
  });
});
