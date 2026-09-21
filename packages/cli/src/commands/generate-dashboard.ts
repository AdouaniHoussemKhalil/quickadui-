import { resolve } from "node:path";
import { checkRequiredPackages } from "../generate/check-prerequisites.js";
import { renderDashboardPage, type DashboardWidgetOptions } from "../generate/dashboard-templates.js";
import { renderGenerateDashboardNextSteps } from "../generate/render-generate-next-steps.js";
import { writeScaffoldFiles } from "../generate/write-files.js";

// `Widget`/`WidgetGrid` (always, once there's at least one widget) come
// from @quickadui/shell; `StatCard` (only when at least one widget is
// `type: "stat"`) comes from @quickadui/charts. Neither is required with
// zero widgets — `dashboard-templates.ts`'s own `renderDashboardPage`
// imports neither in that case, so this command mirrors that exactly
// rather than requiring both packages unconditionally whenever
// `dashboard.enabled` is true.
const SHELL_PACKAGE = "@quickadui/shell";
const CHARTS_PACKAGE = "@quickadui/charts";

export interface GenerateDashboardOptions {
  readonly projectDir: string;
  readonly widgets: readonly DashboardWidgetOptions[];
  readonly columns?: 1 | 2 | 3 | 4 | undefined;
}

export interface GenerateDashboardResult {
  readonly filesWritten: readonly string[];
  readonly nextSteps: string;
}

/**
 * Generates `src/pages/DashboardPage.tsx` from an already-resolved list
 * of widgets — see `dashboard-templates.ts`'s own header comment for what
 * gets generated. Unlike `generate resource`/`generate auth`/`generate
 * app`, this has no standalone `quickadui generate dashboard` CLI
 * subcommand yet (same "config-only, no flag" reasoning `toasts`/
 * `confirmDelete`/`theme.colors` already settled on): a widget's shape
 * (id/type/title/resource/metric/limit/icon) doesn't fit a single-string
 * flag mini-format the way `--navbar-items` does, so today the only
 * caller is `apply.ts`, which resolves each widget's `resource: "name"`
 * string against `resources[]` before calling this.
 */
export function runGenerateDashboard(options: GenerateDashboardOptions): GenerateDashboardResult {
  const projectDir = resolve(options.projectDir);

  const requiredPackages: string[] = [];
  if (options.widgets.length > 0) {
    requiredPackages.push(SHELL_PACKAGE);
  }
  if (options.widgets.some((widget) => widget.type === "stat")) {
    requiredPackages.push(CHARTS_PACKAGE);
  }
  checkRequiredPackages(projectDir, requiredPackages);

  const file = renderDashboardPage({
    widgets: options.widgets,
    ...(options.columns !== undefined ? { columns: options.columns } : {}),
  });
  const filesWritten = writeScaffoldFiles(projectDir, [file]);

  return {
    filesWritten,
    nextSteps: renderGenerateDashboardNextSteps({ widgetCount: options.widgets.length, filesWritten }),
  };
}
