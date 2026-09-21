#!/usr/bin/env node
// create-quickadui — the `quickadui init`/`add`/`generate` scaffolding
// CLI. `init` scaffolds a new Vite + React + TypeScript + Tailwind v4
// project; `add` installs QuickadUI packages (and their dependency
// closure) into an existing one; `generate` writes a working front end
// for one resource or for login/profile, wired against a REST API (a
// free demo one by default — see README.md) — front-end only, no back
// end is generated. See README.md for full usage.
import { parseArgs } from "./args.js";
import { runAdd } from "./commands/add.js";
import { runApply } from "./commands/apply.js";
import { runGenerateApp } from "./commands/generate-app.js";
import { runGenerateAuth } from "./commands/generate-auth.js";
import { runGenerateResource } from "./commands/generate-resource.js";
import { runInit } from "./commands/init.js";

const HELP_TEXT = `quickadui — scaffold and grow a QuickadUI project

Usage:
  quickadui init [directory] [--force]
      Scaffold a new Vite + React + TypeScript + Tailwind v4 project.
      Defaults to the current directory.

  quickadui add <package...> [--dir <path>] [--pm npm|pnpm|yarn]
      Add one or more QuickadUI packages (e.g. "core", "forms") to the
      package.json in the current directory, along with everything they
      depend on. Defaults to npm.

  quickadui generate resource <TypeName> --fields "name:type,..." [--endpoint <path>] [--api-base <url>] [--dir <path>]
      Generate a typed API client, a Zod schema, a list page, and a
      create/edit form page for one resource. Requires "core", "data",
      and "forms" already added (\`quickadui add core data forms\`).
      --api-base defaults to the free https://dummyjson.com demo API.

  quickadui generate auth [--api-base <url>] [--dir <path>]
      Generate an auth client, an AuthProvider/useAuth(), a login page,
      and a profile page. Requires "core" and "forms" already added.
      --api-base defaults to the free https://dummyjson.com demo API.

  quickadui generate app [--navbar|--no-navbar] [--sidebar|--no-sidebar] [--footer|--no-footer]
                          [--navbar-items "Label:href,..."] [--sidebar-items "Label:href,..."]
                          [--yes] [--force] [--dir <path>]
      Generate src/App.tsx: a light/dark/system theme toggle plus a hash
      router wired to whatever \`generate resource\`/\`generate auth\` already
      produced. Asks about Navbar/Sidebar/Footer interactively unless every
      relevant flag is passed (or --yes fills in the defaults). Requires
      "core" and "theme" always, plus "shell" if any of Navbar/Sidebar/
      Footer is included. Overwrites an existing src/App.tsx only with
      --force.

  quickadui apply <config.json> [--dir <path>] [--pm npm|pnpm|yarn] [--force]
      Declarative alternative to running add/generate by hand: reads one
      JSON config file (resources, auth, navbar/sidebar/footer, dashboard
      — see quickadui-config.ts for the full schema) and runs add, then
      generate resource for each resource, generate auth if auth.enabled,
      then generate app — non-interactively. Requires \`quickadui init\`
      already run in the target directory. Not every config section is
      wired into codegen yet (per-view fields/actions, theme.default,
      footer.content, dashboard, role/requiresAuth gating); the command's
      output lists exactly what was accepted but not yet generated.

  quickadui --help
      Show this message.
`;

async function main(argv: readonly string[]): Promise<number> {
  const args = parseArgs(argv);

  if (args.help) {
    process.stdout.write(HELP_TEXT);
    return 0;
  }

  if (!args.command) {
    process.stdout.write(HELP_TEXT);
    return 1;
  }

  try {
    if (args.command === "init") {
      const targetDir = args.positionals[0] ?? args.targetDir ?? ".";
      const result = runInit({ targetDir, force: args.force });
      process.stdout.write(`Scaffolded "${result.projectName}" in ${result.projectDir}\n`);
      process.stdout.write(`Wrote ${result.filesWritten.length} files.\n`);
      process.stdout.write("\nNext steps:\n  npm install\n  npm run dev\n");
      return 0;
    }

    if (args.command === "add") {
      const result = runAdd({
        projectDir: args.targetDir ?? ".",
        packageNames: args.positionals,
        packageManager: args.packageManager ?? "npm",
      });
      process.stdout.write(`\n${result.nextSteps}\n`);
      return 0;
    }

    if (args.command === "generate") {
      const [subcommand, ...rest] = args.positionals;

      if (subcommand === "resource") {
        const typeName = rest[0];
        if (typeName === undefined) {
          throw new Error(
            "`quickadui generate resource` needs a type name, e.g. `quickadui generate resource Product`.",
          );
        }
        if (args.fields === undefined) {
          throw new Error(
            '`quickadui generate resource` needs --fields, e.g. --fields "title:string,price:number".',
          );
        }
        const result = runGenerateResource({
          projectDir: args.targetDir ?? ".",
          typeName,
          fieldsSpec: args.fields,
          endpoint: args.endpoint,
          apiBase: args.apiBase,
        });
        process.stdout.write(`\n${result.nextSteps}\n`);
        return 0;
      }

      if (subcommand === "auth") {
        const result = runGenerateAuth({
          projectDir: args.targetDir ?? ".",
          apiBase: args.apiBase,
        });
        process.stdout.write(`\n${result.nextSteps}\n`);
        return 0;
      }

      if (subcommand === "app") {
        const result = await runGenerateApp({
          projectDir: args.targetDir ?? ".",
          force: args.force,
          navbar: args.navbar,
          sidebar: args.sidebar,
          footer: args.footer,
          navbarItemsSpec: args.navbarItems,
          sidebarItemsSpec: args.sidebarItems,
          assumeYes: args.yes,
        });
        process.stdout.write(`\n${result.nextSteps}\n`);
        return 0;
      }

      throw new Error(
        `Unknown \`generate\` subcommand: "${subcommand ?? ""}". Expected "resource", "auth", or "app".`,
      );
    }

    if (args.command === "apply") {
      const configPath = args.positionals[0];
      if (configPath === undefined) {
        throw new Error(
          "`quickadui apply` needs a config file path, e.g. `quickadui apply ./quickadui.config.json`.",
        );
      }
      const result = await runApply({
        projectDir: args.targetDir ?? ".",
        configPath,
        packageManager: args.packageManager ?? "npm",
        force: args.force,
      });
      process.stdout.write(`\n${result.nextSteps}\n`);
      return 0;
    }

    process.stderr.write(`Unknown command: "${args.command}"\n\n${HELP_TEXT}`);
    return 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Error: ${message}\n`);
    return 1;
  }
}

main(process.argv.slice(2)).then((code) => {
  process.exitCode = code;
});
