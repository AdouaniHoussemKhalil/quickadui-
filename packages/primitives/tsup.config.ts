import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  // radix-ui is a real npm dependency, not a peer — keep it external so it's
  // resolved once at install time instead of duplicated into this bundle.
  external: ["react", "react-dom", "radix-ui"],
});
