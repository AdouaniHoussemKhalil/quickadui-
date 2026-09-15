#!/usr/bin/env node
// Post-build step: renders the default QuickadUI tokens through this
// package's own CSS generators and writes the result as real .css files,
// so consumers can `@import "@quickadui/theme/tokens.css";` without running
// any JS themselves. Must run *after* `tsup` (which produces dist/index.js)
// — see the "build" script in package.json.
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { tokens } from "@quickadui/tokens";
import { generateTailwindTheme, generateTokensCss } from "../dist/index.js";

const distDir = fileURLToPath(new URL("../dist/", import.meta.url));

await writeFile(`${distDir}tokens.css`, generateTokensCss(tokens));
await writeFile(`${distDir}tailwind-theme.css`, generateTailwindTheme(tokens));

console.log("Wrote dist/tokens.css and dist/tailwind-theme.css");
