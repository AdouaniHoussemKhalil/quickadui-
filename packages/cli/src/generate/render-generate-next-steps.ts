// "What to do next" text for `generate resource`/`generate auth` — same
// spirit as `render-add-next-steps.ts`: tell the person exactly what to
// paste where, rather than leaving them to infer it from a bare file
// list.

import { toKebabCase } from "./case.js";

const DUMMYJSON_API_BASE = "https://dummyjson.com";

export interface GenerateResourceNextStepsOptions {
  readonly typeName: string;
  readonly endpoint: string;
  readonly apiBase: string;
  readonly filesWritten: readonly string[];
}

export function renderGenerateResourceNextSteps(options: GenerateResourceNextStepsOptions): string {
  const { typeName, endpoint, apiBase, filesWritten } = options;
  const kebab = toKebabCase(typeName);

  const lines: string[] = [];
  lines.push(`Generated ${filesWritten.length} files for ${typeName}:`);
  for (const file of filesWritten) {
    lines.push(`  ${file}`);
  }
  lines.push("");
  lines.push("Next steps:");
  lines.push(
    `  1. Render <${typeName}ListPage /> and <${typeName}FormPage /> from wherever your app renders`,
  );
  lines.push(
    `     pages — a router, or a simple hash switch. The generated pages link to` +
      ` "#/${endpoint}/new"`,
  );
  lines.push(`     and "#/${endpoint}/:id/edit"; match those in your own routing (or edit the links).`);

  if (apiBase === DUMMYJSON_API_BASE) {
    lines.push(
      "  2. This points at the free DummyJSON demo API. Its add/update/delete endpoints respond",
    );
    lines.push(
      "     successfully but don't persist anything — a deleted or edited row can reappear after",
    );
    lines.push(
      `     a refresh. Regenerate with --api-base <your-api> once you have a real backend for ${kebab}.`,
    );
  } else {
    lines.push(`  2. Pointed at ${apiBase} — double check its REST shape matches what was generated`);
    lines.push(`     (GET/POST .../add/PUT/DELETE .../${endpoint}). If it differs, set`);
    lines.push(`     resources[].endpoints in your quickadui.config.json and regenerate via`);
    lines.push(`     \`quickadui apply\` (see packages/cli/README.md) instead of hand-editing`);
    lines.push(`     src/api/*.api.ts.`);
  }

  return lines.join("\n");
}

export interface GenerateAuthNextStepsOptions {
  readonly apiBase: string;
  readonly filesWritten: readonly string[];
}

export function renderGenerateAuthNextSteps(options: GenerateAuthNextStepsOptions): string {
  const { apiBase, filesWritten } = options;

  const lines: string[] = [];
  lines.push(`Generated ${filesWritten.length} files:`);
  for (const file of filesWritten) {
    lines.push(`  ${file}`);
  }
  lines.push("");
  lines.push("Next steps:");
  lines.push("  1. Wrap your app in <AuthProvider> once, near the root (src/main.tsx or src/App.tsx).");
  lines.push("  2. Render <LoginPage /> for signed-out visitors and <ProfilePage /> for a profile route —");
  lines.push("     both read/write auth state via useAuth() from src/auth/AuthProvider.");

  if (apiBase === DUMMYJSON_API_BASE) {
    lines.push('  3. Try signing in with the demo account: username "emilys", password "emilyspass"');
    lines.push("     (any user at https://dummyjson.com/users works). No sign-up page is generated —");
    lines.push("     DummyJSON's /users/add doesn't persist a real account, so it wouldn't be a real one.");
  } else {
    lines.push(`  3. Pointed at ${apiBase} — double check its /auth/login and /auth/me match what was`);
    lines.push("     generated and adjust src/auth/auth-client.ts if not.");
  }

  return lines.join("\n");
}

export interface GenerateAppNextStepsOptions {
  readonly navbar: boolean;
  readonly sidebar: boolean;
  readonly footer: boolean;
  readonly featureCount: number;
  readonly filesWritten: readonly string[];
}

export function renderGenerateAppNextSteps(options: GenerateAppNextStepsOptions): string {
  const { navbar, sidebar, footer, featureCount, filesWritten } = options;

  const shellParts = [navbar && "a Navbar", sidebar && "a Sidebar", footer && "a Footer"].filter(
    (part): part is string => Boolean(part),
  );

  const lines: string[] = [];
  lines.push(`Generated ${filesWritten.length} file${filesWritten.length === 1 ? "" : "s"}:`);
  for (const file of filesWritten) {
    lines.push(`  ${file}`);
  }
  lines.push("");
  lines.push(
    shellParts.length > 0
      ? `src/App.tsx now has ${shellParts.join(", ")}, a light/dark/system theme toggle, and routes to`
      : "src/App.tsx now has a light/dark/system theme toggle and routes to",
  );
  lines.push(
    featureCount > 0
      ? `${featureCount} already-generated page${featureCount === 1 ? "" : "s"} — re-run \`quickadui generate app --force\` any`
      : "nothing yet (no \`generate resource\`/\`generate auth\` output found) — re-run this any",
  );
  lines.push("time after generating more resources or auth, to pick up their pages too.");
  lines.push("");
  lines.push("Next steps:");
  lines.push(
    "  1. Make sure your CSS entry point imports @quickadui/theme's generated stylesheets — this is",
  );
  lines.push(
    "     what makes the theme toggle (and every QuickadUI component's color) actually visible:",
  );
  lines.push("");
  lines.push('     @import "@quickadui/theme/tokens.css";');
  lines.push('     @import "@quickadui/theme/tailwind-theme.css";');
  lines.push("");
  lines.push(
    "     (`quickadui add theme` prints these same two lines — already done if you added theme",
  );
  lines.push("     through that, rather than getting it transitively.)");
  lines.push("  2. `npm run dev` and toggle the theme button — light/dark/system should all visibly differ.");

  return lines.join("\n");
}

export interface GenerateDashboardNextStepsOptions {
  readonly widgetCount: number;
  readonly filesWritten: readonly string[];
}

export function renderGenerateDashboardNextSteps(options: GenerateDashboardNextStepsOptions): string {
  const { widgetCount, filesWritten } = options;

  const lines: string[] = [];
  lines.push(`Generated ${filesWritten.length} file${filesWritten.length === 1 ? "" : "s"}:`);
  for (const file of filesWritten) {
    lines.push(`  ${file}`);
  }
  lines.push("");

  if (widgetCount === 0) {
    lines.push(
      'src/pages/DashboardPage.tsx has no widgets yet — it just prints a placeholder. Add entries to',
    );
    lines.push('"dashboard.widgets" in your quickadui config and re-run `quickadui apply` to fill it in.');
  } else {
    lines.push(
      `src/pages/DashboardPage.tsx now renders ${widgetCount} widget${widgetCount === 1 ? "" : "s"} in a`,
    );
    lines.push(
      "WidgetGrid — each fetches its own data on mount from its resource's own already-generated API",
    );
    lines.push("client, independently of the others.");
    lines.push("");
    lines.push("Next steps:");
    lines.push(
      '  1. Render <DashboardPage /> from wherever your app renders pages — `quickadui generate app`',
    );
    lines.push(
      '     (or `quickadui apply`, which calls it for you) wires it to "dashboard.route" automatically',
    );
    lines.push("     when this config's dashboard is enabled.");
    lines.push(
      "  2. Widget order/columns are read-only for now (no drag-and-drop persistence wired up yet) —",
    );
    lines.push(
      '     reorder by editing "dashboard.widgets"\' order in your config and re-applying.',
    );
  }

  return lines.join("\n");
}
