import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// The apps/docs MVP: a real, running Vite + MDX skeleton (QuickadUI
// Blueprint §10) — nav, layout, a handful of hand-written pages. Generated
// prop tables and live Sandpack playgrounds are explicitly deferred to a
// later round; see the project status doc for the full scope decision.
//
// `@mdx-js/rollup` must run with `enforce: "pre"`, ahead of
// `@vitejs/plugin-react`, so `.mdx` source is compiled to JSX *before* the
// React plugin's own transform sees the file — otherwise the React plugin
// tries to parse raw MDX as JS/TSX and fails. `@vitejs/plugin-react`'s
// default `include` only matches `.jsx`/`.tsx` by extension, so it's
// widened here to also apply the JSX transform to MDX's compiled output.
export default defineConfig({
  plugins: [
    { enforce: "pre", ...mdx() },
    react({ include: [/\.[jt]sx?$/, /\.mdx?$/] }),
    tailwindcss(),
  ],
  server: {
    port: 5174,
  },
});
