#!/usr/bin/env node
// create-quickadui — the `quickadui init` and `quickadui add` scaffolding
// CLI. `init` scaffolds a new Vite + React + TypeScript + Tailwind v4
// project; `add` installs QuickadUI packages (and their dependency
// closure) into an existing one. See README.md for full usage.
import { parseArgs } from "./args.js";
import { runAdd } from "./commands/add.js";
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

  quickadui --help
      Show this message.
`;

function main(argv: readonly string[]): number {
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

    process.stderr.write(`Unknown command: "${args.command}"\n\n${HELP_TEXT}`);
    return 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Error: ${message}\n`);
    return 1;
  }
}

process.exitCode = main(process.argv.slice(2));
