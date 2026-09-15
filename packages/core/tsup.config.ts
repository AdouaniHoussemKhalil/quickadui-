import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  // @quickadui/primitives and @quickadui/utils are real workspace
  // dependencies — external so they're resolved via node_modules once,
  // instead of duplicated into every package that bundles them.
  external: ["react", "react-dom", "@quickadui/primitives", "@quickadui/utils"],
});
