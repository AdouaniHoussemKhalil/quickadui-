import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { ScaffoldFile } from "../templates.js";

/**
 * Writes each (path, contents) pair under `projectDir`, creating parent
 * directories as needed — same write loop `commands/init.ts` uses for
 * the initial scaffold, shared here since `generate resource`/`generate
 * auth` both need exactly the same thing. Overwrites existing files
 * without asking: re-running the same `generate` command is meant to
 * regenerate, not append (every generated file says so in its own header
 * comment).
 */
export function writeScaffoldFiles(projectDir: string, files: readonly ScaffoldFile[]): readonly string[] {
  const filesWritten: string[] = [];
  for (const file of files) {
    const absolutePath = join(projectDir, file.path);
    mkdirSync(dirname(absolutePath), { recursive: true });
    writeFileSync(absolutePath, file.contents, "utf8");
    filesWritten.push(file.path);
  }
  return filesWritten;
}
