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
  /** `generate resource`'s `--fields "name:type,..."`. */
  readonly fields?: string | undefined;
  /** `generate resource`'s `--endpoint <path>`. */
  readonly endpoint?: string | undefined;
  /** `generate resource`/`generate auth`'s `--api-base <url>`. */
  readonly apiBase?: string | undefined;
  /** `generate app`'s `--navbar`/`--no-navbar`. `undefined` means "not passed" — the command asks (or, with `yes`, picks a default) rather than treating this as false. */
  readonly navbar?: boolean | undefined;
  /** `generate app`'s `--sidebar`/`--no-sidebar`. Same `undefined`-means-"not passed" rule as `navbar`. */
  readonly sidebar?: boolean | undefined;
  /** `generate app`'s `--footer`/`--no-footer`. Same `undefined`-means-"not passed" rule as `navbar`. */
  readonly footer?: boolean | undefined;
  /** `generate app`'s `--navbar-items "Label:href,..."`. */
  readonly navbarItems?: string | undefined;
  /** `generate app`'s `--sidebar-items "Label:href,..."`. */
  readonly sidebarItems?: string | undefined;
  /** `generate app`'s `--yes`/`-y` — skip every interactive prompt, filling in defaults for anything not already pinned by a flag. */
  readonly yes: boolean;
}

function isPackageManager(value: string): value is PackageManager {
  return (PACKAGE_MANAGERS as readonly string[]).includes(value);
}

/**
 * Parses `process.argv.slice(2)`-style argv into a command name, its
 * positional arguments, and flags. Recognized flags: `--help`/`-h`,
 * `--force`/`-f`, `--dir`/`-C <path>`, `--pm <npm|pnpm|yarn>`,
 * `--fields <spec>`, `--endpoint <path>`, `--api-base <url>`. Anything
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
  let fields: string | undefined;
  let endpoint: string | undefined;
  let apiBase: string | undefined;
  let navbar: boolean | undefined;
  let sidebar: boolean | undefined;
  let footer: boolean | undefined;
  let navbarItems: string | undefined;
  let sidebarItems: string | undefined;
  let yes = false;

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
    } else if (arg === "--fields") {
      const value = argv[i + 1];
      if (value !== undefined) {
        fields = value;
      }
      i++;
    } else if (arg === "--endpoint") {
      const value = argv[i + 1];
      if (value !== undefined) {
        endpoint = value;
      }
      i++;
    } else if (arg === "--api-base") {
      const value = argv[i + 1];
      if (value !== undefined) {
        apiBase = value;
      }
      i++;
    } else if (arg === "--navbar") {
      navbar = true;
    } else if (arg === "--no-navbar") {
      navbar = false;
    } else if (arg === "--sidebar") {
      sidebar = true;
    } else if (arg === "--no-sidebar") {
      sidebar = false;
    } else if (arg === "--footer") {
      footer = true;
    } else if (arg === "--no-footer") {
      footer = false;
    } else if (arg === "--navbar-items") {
      const value = argv[i + 1];
      if (value !== undefined) {
        navbarItems = value;
      }
      i++;
    } else if (arg === "--sidebar-items") {
      const value = argv[i + 1];
      if (value !== undefined) {
        sidebarItems = value;
      }
      i++;
    } else if (arg === "--yes" || arg === "-y") {
      yes = true;
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
    fields,
    endpoint,
    apiBase,
    navbar,
    sidebar,
    footer,
    navbarItems,
    sidebarItems,
    yes,
  };
}
