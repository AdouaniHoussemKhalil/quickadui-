#!/usr/bin/env node
// Post-build step: copies the hand-authored `chart-tokens.css` (the
// validated categorical chart palette — see that file's own doc comment
// for why it's hand-written rather than generated the way
// `@quickadui/theme`'s tokens.css is) into `dist/`, so consumers can
// `@import "@quickadui/charts/chart-tokens.css";` without running any JS
// themselves. Must run *after* `tsup` — see the "build" script in
// package.json.
import { copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const srcDir = fileURLToPath(new URL("../src/", import.meta.url));
const distDir = fileURLToPath(new URL("../dist/", import.meta.url));

await copyFile(`${srcDir}chart-tokens.css`, `${distDir}chart-tokens.css`);

console.log("Wrote dist/chart-tokens.css");
