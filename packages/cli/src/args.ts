// Pure argv parsing. Deliberately hand-rolled and tiny — the CLI only
// has two commands and a handful of flags, so a dependency like
// `commander`/`yargs` isn't worth it (and would be one more thing this
// sandbox can't actually install and exercise against the real package).
//
// Every optional field below is explicitly `| undefined`, not just `?:`.
// This project has hit the same `exactOptionalPropertyTypes` bug several
// times now (form.tsx, toaster.tsx, tree-view.tsx): a field declared only
// `foo?: T` rejects an object literal that assigns it `T | undefined`
// even though the key itself is optional. Writing `| undefined` up front
// here avoids re-learning that lesson a fifth time.

export type PackageManager = "npm" | "pnpm" | "yarn";

const PACKAGE_MANAGERS: readonly PackageManager[] = ["npm", "pnpm", "yarn"];

export interface ParsedArgs {
  readonly command?: string | undefined;
  readonly positionals: readonly string[];
  readonly packageManager?: PackageManager | undefined;
  readonly targetDir?: string | undefined;
  readonly help: boolean;
  readonly force: boolean;
}

function isPackageManager(value: string): value is PackageManager {
  return (PACKAGE_MANAGERS as readonly string[]).includes(value);
}

/**
 * Parses `process.argv.slice(2)`-style argv into a command name, its
 * positional arguments, and flags. Recognized flags: `--help`/`-h`,
 * `--force`/`-f`, `--dir`/`-C <path>`, `--pm <npm|pnpm|yarn>`. Anything
 * else that starts with `-` is ignored rather than rejected — this is a
 * scaffolding convenience tool, not a strict CLI framework, and an
 * unknown flag shouldn't block `--help` from working.
 */
export function parseArgs(argv: readonly string[]): ParsedArgs {
  const positionals: string[] = [];
  let packageManager: PackageManager | undefined;
  let targetDir: string | undefined;
  let help = false;
  let force = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === undefined) {
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      help = true;
    } else if (arg === "--force" || arg === "-f") {
      force = true;
    } else if (arg === "--pm") {
      const value = argv[i + 1];
      if (value !== undefined && isPackageManager(value)) {
        packageManager = value;
      }
      i++;
    } else if (arg === "--dir" || arg === "-C") {
      const value = argv[i + 1];
      if (value !== undefined) {
        targetDir = value;
      }
      i++;
    } else if (!arg.startsWith("-")) {
      positionals.push(arg);
    }
  }

  const [command, ...rest] = positionals;

  return {
    command,
    positionals: rest,
    packageManager,
    targetDir,
    help,
    force,
  };
}
