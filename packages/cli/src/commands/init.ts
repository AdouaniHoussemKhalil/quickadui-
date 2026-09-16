import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { renderScaffoldFiles } from "../templates.js";

export interface InitOptions {
  readonly targetDir: string;
  readonly force: boolean;
}

export interface InitResult {
  readonly projectDir: string;
  readonly projectName: string;
  readonly filesWritten: readonly string[];
}

/**
 * Scaffolds a new Vite + React + TypeScript + Tailwind v4 project at
 * `options.targetDir`, pre-wired to install QuickadUI packages into next
 * (via `quickadui add`). Refuses to write into a directory that already
 * exists and isn't empty, unless `options.force` is set — this is the
 * only guard against clobbering someone's existing project, so it isn't
 * optional.
 */
export function runInit(options: InitOptions): InitResult {
  const projectDir = resolve(options.targetDir);
  const projectName = basename(projectDir);

  if (existsSync(projectDir)) {
    const existingEntries = readdirSync(projectDir);
    if (existingEntries.length > 0 && !options.force) {
      throw new Error(
        `"${projectDir}" already exists and isn't empty. Choose a different directory, or pass --force to write into it anyway.`,
      );
    }
  }

  const files = renderScaffoldFiles(projectName);
  const filesWritten: string[] = [];

  for (const file of files) {
    const absolutePath = join(projectDir, file.path);
    mkdirSync(dirname(absolutePath), { recursive: true });
    writeFileSync(absolutePath, file.contents, "utf8");
    filesWritten.push(file.path);
  }

  return { projectDir, projectName, filesWritten };
}
