// Orchestrates `quickadui apply <config.json>`: the declarative
// alternative to chaining `add`/`generate resource`/`generate auth`/
// `generate app` by hand. This file is the only place that reads the
// config file or touches the filesystem for this feature — parsing and
// validation live in `../quickadui-config.ts` (pure), and every actual
// generation step below calls the *same* `runAdd`/`runGenerateResource`/
// `runGenerateAuth`/`runGenerateApp` functions the standalone commands
// already use, rather than duplicating any generation logic.
//
// Not every section of a `QuickaduiConfig` is wired into codegen yet —
// see the `warnings` on `ApplyResult` (and the "not yet generated from"
// comments below) for exactly what's validated today but still a no-op:
// per-view field/action lists (a flat `fields` list is used for every
// view), `footer.content`, and `role`/`requiresAuth` gating on nav items
// and actions. All of that is accepted by `parseQuickaduiConfig` today
// specifically so config files written against this version keep
// validating (and keep documenting intent) once those generators catch
// up — see quickadui-config.ts's own header comment.

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { PackageManager } from "../args.js";
import { toKebabCase, toNaivePlural, toPascalCase } from "../generate/case.js";
import type { DashboardWidgetOptions } from "../generate/dashboard-templates.js";
import { parseQuickaduiConfig, type QuickaduiConfig } from "../quickadui-config.js";
import { type AddResult, runAdd } from "./add.js";
import { type GenerateAppResult, runGenerateApp } from "./generate-app.js";
import { type GenerateAuthResult, runGenerateAuth } from "./generate-auth.js";
import { type GenerateDashboardResult, runGenerateDashboard } from "./generate-dashboard.js";
import { type GenerateResourceResult, runGenerateResource } from "./generate-resource.js";

export interface ApplyOptions {
  readonly projectDir: string;
  /** Path to the JSON config file, relative to the current working directory (not `projectDir`) — same as any other CLI-provided path. */
  readonly configPath: string;
  readonly packageManager: PackageManager;
  /** Forwarded to `generate app` — required to overwrite an existing `src/App.tsx`. */
  readonly force: boolean;
}

export interface ApplyResourceResult {
  readonly name: string;
  readonly result: GenerateResourceResult;
}

export interface ApplyResult {
  readonly config: QuickaduiConfig;
  readonly addResult: AddResult;
  readonly resourceResults: readonly ApplyResourceResult[];
  readonly authResult: GenerateAuthResult | undefined;
  readonly dashboardResult: GenerateDashboardResult | undefined;
  readonly appResult: GenerateAppResult;
  /**
   * Config sections that were valid and are reflected in `config` but
   * aren't reflected in any generated file yet — printed prominently in
   * `nextSteps` so a config author isn't left assuming something was
   * applied when it wasn't.
   */
  readonly warnings: readonly string[];
  readonly nextSteps: string;
}

const CORE_PACKAGE = "@quickadui/core";
const THEME_PACKAGE = "@quickadui/theme";
const DATA_PACKAGE = "@quickadui/data";
const FORMS_PACKAGE = "@quickadui/forms";
const SHELL_PACKAGE = "@quickadui/shell";
const ICONS_PACKAGE = "@quickadui/icons";
const OVERLAYS_PACKAGE = "@quickadui/overlays";
const CHARTS_PACKAGE = "@quickadui/charts";
const DEFAULT_DASHBOARD_ROUTE = "#/";

function readConfigFile(configPath: string): unknown {
  const absolutePath = resolve(configPath);
  if (!existsSync(absolutePath)) {
    throw new Error(`No config file found at "${absolutePath}".`);
  }
  const raw = readFileSync(absolutePath, "utf8");
  try {
    return JSON.parse(raw);
  } catch (cause) {
    throw new Error(`"${absolutePath}" isn't valid JSON.`, { cause });
  }
}

/** Every QuickadUI package this config's generation steps are about to need, deduplicated. `generate app` always needs core+theme (see generate-app.ts), plus shell whenever any of navbar/sidebar/footer is enabled. */
function requiredPackagesFor(config: QuickaduiConfig): readonly string[] {
  const packages = new Set<string>([CORE_PACKAGE, THEME_PACKAGE]);

  if (config.resources.length > 0) {
    packages.add(DATA_PACKAGE);
    packages.add(FORMS_PACKAGE);
  }
  if (config.auth?.enabled) {
    packages.add(FORMS_PACKAGE);
  }

  // `runGenerateApp` (called below with `assumeYes: true`) defaults an
  // unset navbar/footer to `true` and an unset sidebar to `false` — see
  // generate-app.ts's own `navbar ??= true; sidebar ??= false; footer ??=
  // true;`. Mirroring those same defaults here (rather than only checking
  // for an explicit `true`) matters: a config that omits `navbar`/`footer`
  // entirely still ends up needing shell, because generate-app's default
  // shell *is* on.
  const navbarOn = config.navbar?.enabled ?? true;
  const sidebarOn = config.sidebar?.enabled ?? false;
  const footerOn = config.footer?.enabled ?? true;
  if (navbarOn || sidebarOn || footerOn) {
    packages.add(SHELL_PACKAGE);
  }

  // Mirrors app-shell-templates.ts's own `usedIconNames`: only an icon on
  // an item belonging to a section that's actually going to render
  // (navbar/sidebar resolved the same way as just above) needs the icons
  // package — an icon on a sidebar item is irrelevant if sidebar ends up
  // off. Also mirrors resource-templates.ts's own `iconImportLine`:
  // `resources[].buttonIcons` renders unconditionally (there's no
  // "section enabled" gate for a resource's own generated pages), so any
  // one of its five slots being set is enough on its own.
  const rendersAnyIcon =
    (navbarOn ? (config.navbar?.items ?? []) : []).some((item) => item.icon !== undefined) ||
    (sidebarOn ? (config.sidebar?.items ?? []) : []).some((item) => item.icon !== undefined) ||
    config.resources.some((resource) => {
      const icons = resource.buttonIcons;
      return (
        icons !== undefined &&
        (icons.create !== undefined ||
          icons.edit !== undefined ||
          icons.delete !== undefined ||
          icons.save !== undefined ||
          icons.cancel !== undefined)
      );
    });
  if (rendersAnyIcon) {
    packages.add(ICONS_PACKAGE);
  }

  // `resources[].toasts`/`confirmDelete` both render through
  // `@quickadui/overlays` (`toast`/`Toaster`, `Modal` respectively) —
  // neither is a transitive dependency of anything else this closure
  // might already be adding (confirmed in packages.ts: core/data/forms/
  // shell none of them depend on overlays), so it needs its own check.
  const needsOverlays = config.resources.some(
    (resource) =>
      resource.toasts !== undefined ||
      (resource.confirmDelete !== undefined && resource.confirmDelete !== false),
  );
  if (needsOverlays) {
    packages.add(OVERLAYS_PACKAGE);
  }

  // Mirrors `generate-dashboard.ts`'s own conditional package check
  // exactly: `@quickadui/shell` (WidgetGrid/Widget) is only needed once
  // there's at least one widget to render, `@quickadui/charts` (StatCard)
  // only once at least one of them is `type: "stat"` — a
  // `dashboard.enabled: true` with an empty/unset `widgets` array (or
  // dashboard disabled entirely) needs neither on its own account.
  const dashboardWidgets = config.dashboard?.enabled ? (config.dashboard.widgets ?? []) : [];
  if (dashboardWidgets.length > 0) {
    packages.add(SHELL_PACKAGE);
  }
  if (dashboardWidgets.some((widget) => widget.type === "stat")) {
    packages.add(CHARTS_PACKAGE);
  }

  return [...packages];
}

/** Mirrors `requiredPackagesFor`'s own `resources[].toasts` check — whether `generate app` needs to mount `<Toaster />` at all. */
function needsToaster(config: QuickaduiConfig): boolean {
  return config.resources.some((resource) => resource.toasts !== undefined);
}

/**
 * Resolves each `dashboard.widgets[].resource` — a `resources[].name`
 * string, already validated by `parseQuickaduiConfig` to reference a
 * real resource — into the `{typeName, endpoint, primaryField}`
 * `dashboard-templates.ts` actually needs to import that resource's own
 * generated API client and schema type. Applies the exact same
 * `endpoint` default (`toKebabCase(toNaivePlural(typeName))`) that
 * `runGenerateResource` itself falls back to, so a widget referencing a
 * resource with no explicit `endpoint` still imports the right
 * `list<Plural>`/`<kebab>.api` file `generate resource` actually wrote.
 * Returns `[]` when dashboard isn't enabled, same "nothing to resolve"
 * shortcut `requiredPackagesFor`'s own `dashboardWidgets` uses.
 */
function resolveDashboardWidgets(config: QuickaduiConfig): DashboardWidgetOptions[] {
  if (!config.dashboard?.enabled) {
    return [];
  }
  return (config.dashboard.widgets ?? []).map((widget) => {
    const resourceConfig = config.resources.find((r) => r.name === widget.resource);
    if (!resourceConfig) {
      // Unreachable in practice — `parseQuickaduiConfig` already rejects
      // a dashboard widget referencing an unknown resource before this
      // ever runs — but keeps this function total instead of silently
      // generating a broken import if that validation is ever loosened.
      throw new Error(
        `dashboard widget "${widget.id}" references unknown resource "${widget.resource}".`,
      );
    }
    const typeName = toPascalCase(resourceConfig.name);
    const endpoint = resourceConfig.endpoint ?? toKebabCase(toNaivePlural(typeName));
    const primaryField = resourceConfig.fields[0]?.name;
    // Same default `resource-templates.ts`'s own `resolveEndpoints` uses
    // for `endpoints.list.responseShape` — every widget below reads from
    // the exact same generated `list<Plural>()` a resource's own list
    // page does, so it must resolve to the same shape that function was
    // actually generated with, not silently assume the "wrapped" default.
    const responseShape = resourceConfig.endpoints?.list?.responseShape ?? "wrapped";
    return {
      id: widget.id,
      type: widget.type,
      title: widget.title,
      resource: {
        typeName,
        endpoint,
        responseShape,
        ...(primaryField !== undefined ? { primaryField } : {}),
      },
      ...(widget.metric !== undefined ? { metric: widget.metric } : {}),
      ...(widget.limit !== undefined ? { limit: widget.limit } : {}),
      ...(widget.icon !== undefined ? { icon: widget.icon } : {}),
    };
  });
}

/** `quickadui generate app`'s own `--navbar-items`/`--sidebar-items` mini-format — reused here instead of touching `nav-items.ts`, since `runGenerateApp` already parses this string itself. Carries `icon` through (the mini-format's optional third `:`-separated segment — see `nav-items.ts`'s `parseNavItemsSpec`), since that field *is* wired into codegen. Drops `role`/`requiresAuth`: see the `warnings` this produces at the call site. */
function formatItemsSpec(
  items: readonly { readonly label: string; readonly href: string; readonly icon?: string }[],
): string {
  return items
    .map((item) =>
      item.icon !== undefined
        ? `${item.label}:${item.href}:${item.icon}`
        : `${item.label}:${item.href}`,
    )
    .join(",");
}

function collectWarnings(config: QuickaduiConfig): readonly string[] {
  const warnings: string[] = [];

  const anyPerViewShape = config.resources.some((r) => r.views !== undefined);
  if (anyPerViewShape) {
    warnings.push(
      'resources[].views (per-view fields/actions) was validated but is not yet reflected in generated code — every view currently gets the resource\'s full flat "fields" list, and "actions" entries are ignored. Real per-view + per-action codegen is still on the roadmap.',
    );
  }

  const anyRoleOrAuthGating =
    (config.navbar?.items ?? []).some((i) => i.role !== undefined || i.requiresAuth) ||
    (config.sidebar?.items ?? []).some((i) => i.role !== undefined || i.requiresAuth);
  if (anyRoleOrAuthGating) {
    warnings.push(
      '"role"/"requiresAuth" on navbar/sidebar items was validated but isn\'t enforced yet — every generated nav item is currently visible to everyone, logged in or not.',
    );
  }

  if (config.footer?.content !== undefined) {
    warnings.push(
      "footer.content was validated but generate app's footer text is still hardcoded (\"© <year> <project name>\") — your custom content isn't in the generated file yet.",
    );
  }

  return warnings;
}

function renderApplyNextSteps(result: Omit<ApplyResult, "nextSteps">): string {
  const lines: string[] = [];

  if (result.warnings.length > 0) {
    lines.push("Validated but not yet generated from your config:");
    for (const warning of result.warnings) {
      lines.push(`  - ${warning}`);
    }
    lines.push("");
  }

  lines.push(result.addResult.nextSteps.trim());

  for (const { name, result: resourceResult } of result.resourceResults) {
    lines.push("");
    lines.push(`--- ${name} ---`);
    lines.push(resourceResult.nextSteps.trim());
  }

  if (result.authResult) {
    lines.push("");
    lines.push("--- auth ---");
    lines.push(result.authResult.nextSteps.trim());
  }

  if (result.dashboardResult) {
    lines.push("");
    lines.push("--- dashboard ---");
    lines.push(result.dashboardResult.nextSteps.trim());
  }

  lines.push("");
  lines.push("--- app shell ---");
  lines.push(result.appResult.nextSteps.trim());

  return lines.join("\n");
}

/**
 * Reads and validates the JSON file at `options.configPath`, then — in
 * order — adds every QuickadUI package the config's contents will need
 * (`runAdd`), generates each declared resource (`runGenerateResource`),
 * generates auth if `auth.enabled` (`runGenerateAuth`), and finally
 * generates `src/App.tsx` wired to all of it (`runGenerateApp`, always
 * non-interactive — a config file replaces the prompts, it doesn't
 * answer them). Requires `quickadui init` to have already been run in
 * `options.projectDir` (same prerequisite `add`/`generate` already have).
 */
export async function runApply(options: ApplyOptions): Promise<ApplyResult> {
  const projectDir = resolve(options.projectDir);
  const raw = readConfigFile(options.configPath);
  const config = parseQuickaduiConfig(raw);

  const addResult = runAdd({
    projectDir,
    packageNames: requiredPackagesFor(config),
    packageManager: options.packageManager,
  });

  const resourceResults: ApplyResourceResult[] = config.resources.map((resource) => {
    const fieldsSpec = resource.fields.map((field) => `${field.name}:${field.type}`).join(",");
    const result = runGenerateResource({
      projectDir,
      typeName: resource.name,
      fieldsSpec,
      endpoint: resource.endpoint,
      apiBase: resource.apiBase ?? config.project?.apiBase,
      endpoints: resource.endpoints,
      buttonIcons: resource.buttonIcons,
      toasts: resource.toasts,
      confirmDelete: resource.confirmDelete,
    });
    return { name: resource.name, result };
  });

  let authResult: GenerateAuthResult | undefined;
  if (config.auth?.enabled) {
    authResult = runGenerateAuth({
      projectDir,
      apiBase: config.auth.apiBase ?? config.project?.apiBase,
    });
  }

  // Generated before `generate app` (like resources/auth above) so its
  // output file already exists on disk by the time `runGenerateApp`
  // wires up routing.
  let dashboardResult: GenerateDashboardResult | undefined;
  if (config.dashboard?.enabled) {
    dashboardResult = runGenerateDashboard({
      projectDir,
      widgets: resolveDashboardWidgets(config),
      ...(config.dashboard.columns !== undefined ? { columns: config.dashboard.columns } : {}),
    });
  }

  const navbarItemsSpec =
    config.navbar?.items !== undefined ? formatItemsSpec(config.navbar.items) : undefined;
  const sidebarItemsSpec =
    config.sidebar?.items !== undefined ? formatItemsSpec(config.sidebar.items) : undefined;

  const appResult = await runGenerateApp({
    projectDir,
    force: options.force,
    navbar: config.navbar?.enabled,
    sidebar: config.sidebar?.enabled,
    footer: config.footer?.enabled,
    navbarItemsSpec,
    sidebarItemsSpec,
    assumeYes: true,
    defaultTheme: config.theme?.default,
    defaultColors: config.theme?.colors,
    needsToaster: needsToaster(config),
    ...(config.dashboard?.enabled
      ? { dashboardRoute: config.dashboard.route ?? DEFAULT_DASHBOARD_ROUTE }
      : {}),
    ...(config.navbar?.brand !== undefined ? { navbarBrand: config.navbar.brand } : {}),
    ...(config.navbar?.logo !== undefined ? { navbarLogo: config.navbar.logo } : {}),
    ...(config.sidebar?.brand !== undefined ? { sidebarBrand: config.sidebar.brand } : {}),
    ...(config.sidebar?.logo !== undefined ? { sidebarLogo: config.sidebar.logo } : {}),
  });

  const warnings = collectWarnings(config);

  const partialResult = {
    config,
    addResult,
    resourceResults,
    authResult,
    dashboardResult,
    appResult,
    warnings,
  };

  return {
    ...partialResult,
    nextSteps: renderApplyNextSteps(partialResult),
  };
}
