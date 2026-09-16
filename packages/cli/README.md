# @quickadui/cli (published as `create-quickadui`)

The `quickadui` command-line tool: `init` scaffolds a new project, `add`
installs QuickadUI packages into one.

> This is a narrower scope than the package's original placeholder
> description (which also mentioned framework detection and Tailwind
> preset wiring). What's below is what's actually implemented — see
> "What's deliberately out of scope" at the bottom.

## `quickadui init [directory] [--force]`

Scaffolds a new Vite + React 19 + TypeScript + Tailwind v4 project at
`directory` (defaults to the current directory), pre-wired so `quickadui
add` works right away:

```sh
npx create-quickadui init my-app
cd my-app
npm install
npm run dev
```

Writes `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`,
`README.md`, `.gitignore`, `src/main.tsx`, `src/App.tsx`, and
`src/index.css` (with `@import "tailwindcss";`). Every dependency version
in the generated `package.json` is pinned to the same major version this
monorepo itself builds and tests against (React 19, Vite 8, TypeScript 7,
Tailwind v4).

Refuses to write into a directory that already exists and isn't empty —
pass `--force` to scaffold into it anyway.

## `quickadui add <package...> [--dir <path>] [--pm npm|pnpm|yarn]`

Adds one or more QuickadUI packages to the `package.json` in the current
directory (or `--dir`), along with:

- every other QuickadUI package they depend on (e.g. `add forms` also
  pulls in `@quickadui/icons`, `@quickadui/primitives`,
  `@quickadui/theme`, `@quickadui/tokens`, and `@quickadui/utils`), and
- their real external dependencies (React Hook Form, Zod, Motion, Radix,
  Lucide, `class-variance-authority`, `clsx`, `tailwind-merge`, etc.), at
  the version ranges each package actually declares.

```sh
quickadui add core
quickadui add forms data --pm pnpm
```

`add` only ever edits `package.json` — it deliberately does not touch
`src/index.css`. For any installed package that ships its own hardcoded
Tailwind classes (most of them do), it instead prints the exact
`@source "./node_modules/<package>";` line(s) to add by hand, e.g.:

```
Added @quickadui/icons, @quickadui/primitives, @quickadui/tokens, @quickadui/theme, @quickadui/utils, @quickadui/forms to package.json.

Next steps:
  1. Run `pnpm install` to fetch the new dependencies.
  2. Add the following line(s) to your CSS entry point (after your `@import "tailwindcss";`):

     @source "./node_modules/@quickadui/primitives";
     @source "./node_modules/@quickadui/forms";

     Without this, Tailwind won't see these packages' classes once they're
     installed into node_modules, and their components will render unstyled.
```

Rewriting an unfamiliar CSS file automatically risks corrupting whatever
the person already has there — printing the exact line is the safer
trade-off.

`add` fails clearly (non-zero exit, no partial edit) when: no package
name is given, an unknown package name is given, or there's no
`package.json` at the target directory yet (run `init` first).

### Version note

None of the `@quickadui/*` packages are published to npm yet — every one
of them is still at `0.0.0` (see `packages/*/package.json`). `add`
records that honestly as `^0.0.0` rather than inventing a plausible-looking
version. Once real releases ship, update the registry in `src/packages.ts`.

## What's deliberately out of scope

- **No framework detection.** `init` only ever scaffolds the one
  Vite + React + Tailwind template. Detecting/supporting Next.js, Remix,
  etc. is future work, not implemented here.
- **No interactive prompts.** Both commands are fully argv-driven — no
  `inquirer`-style Y/N/select prompts. This keeps the CLI's own
  dependency list at zero and keeps it scriptable.
- **No automatic CSS rewriting**, as explained above under `add`.

## Architecture

Every piece of actual logic — the package registry and its dependency
resolution (`packages.ts`), merging conflicting external dependency
ranges (`merge-external-dependencies.ts`), editing a `package.json`
object (`package-json.ts`), rendering the `@source` line
(`source-directive.ts`), rendering the "next steps" summary
(`render-add-next-steps.ts`), argv parsing (`args.ts`), and the scaffold
file templates (`templates.ts`) — is written as pure functions with real
unit tests. `commands/init.ts` and `commands/add.ts` are the only files
that touch the filesystem, and `index.ts` is a thin argv → command
dispatcher.
