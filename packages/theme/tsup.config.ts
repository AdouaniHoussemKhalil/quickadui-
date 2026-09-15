import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  // @quickadui/tokens is a real workspace dependency — external so it's
  // resolved via node_modules instead of duplicated into this bundle.
  external: ["react", "react-dom", "@quickadui/tokens"],
});
