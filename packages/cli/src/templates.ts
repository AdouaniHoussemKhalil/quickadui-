// Pure template-string builders for `quickadui init`'s scaffold. Every
// dependency version below was copied from this monorepo's own
// `pnpm-workspace.yaml` catalog (fetched and checked, not guessed) —
// so a freshly scaffolded project starts on the same major versions of
// React, Vite, TypeScript and Tailwind that QuickadUI itself is built
// and tested against.

const REACT_VERSION = "^19.0.0";
const REACT_DOM_VERSION = "^19.0.0";
const TYPES_REACT_VERSION = "^19.0.0";
const TYPES_REACT_DOM_VERSION = "^19.0.0";
const TYPESCRIPT_VERSION = "^7.0.0";
const VITE_VERSION = "^8.3.0";
const VITEJS_PLUGIN_REACT_VERSION = "^6.1.0";
const TAILWINDCSS_VERSION = "^4.3.0";
const TAILWINDCSS_VITE_VERSION = "^4.3.0";

export function renderPackageJson(projectName: string): string {
  const pkg = {
    name: projectName,
    private: true,
    version: "0.0.0",
    type: "module",
    scripts: {
      dev: "vite",
      build: "tsc -b && vite build",
      preview: "vite preview",
    },
    dependencies: {
      react: REACT_VERSION,
      "react-dom": REACT_DOM_VERSION,
    },
    devDependencies: {
      "@tailwindcss/vite": TAILWINDCSS_VITE_VERSION,
      "@types/react": TYPES_REACT_VERSION,
      "@types/react-dom": TYPES_REACT_DOM_VERSION,
      "@vitejs/plugin-react": VITEJS_PLUGIN_REACT_VERSION,
      tailwindcss: TAILWINDCSS_VERSION,
      typescript: TYPESCRIPT_VERSION,
      vite: VITE_VERSION,
    },
  };
  return `${JSON.stringify(pkg, null, 2)}\n`;
}

export function renderViteConfig(): string {
  return `import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
`;
}

export function renderTsconfigJson(): string {
  const tsconfig = {
    compilerOptions: {
      target: "ES2022",
      lib: ["ES2022", "DOM", "DOM.Iterable"],
      module: "ESNext",
      moduleResolution: "Bundler",
      jsx: "react-jsx",
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      isolatedModules: true,
      verbatimModuleSyntax: true,
      noEmit: true,
    },
    include: ["src"],
  };
  return `${JSON.stringify(tsconfig, null, 2)}\n`;
}

export function renderIndexHtml(projectName: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}

export function renderMainTsx(): string {
  return `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element with id "root" not found.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`;
}

export function renderAppTsx(projectName: string): string {
  return `export function App() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>${projectName}</h1>
      <p>
        Scaffolded with <code>quickadui init</code>. Run{" "}
        <code>quickadui add core</code> to start pulling in QuickadUI
        components.
      </p>
    </main>
  );
}
`;
}

export function renderViteEnvDts(): string {
  return `/// <reference types="vite/client" />
`;
}

export function renderIndexCss(): string {
  return `@import "tailwindcss";
`;
}

export function renderGitignore(): string {
  return `node_modules
dist
dist-ssr
*.local
.DS_Store
`;
}

export function renderReadme(projectName: string): string {
  return `# ${projectName}

Scaffolded with \`quickadui init\`.

## Getting started

\`\`\`sh
npm install
npm run dev
\`\`\`

## Adding QuickadUI components

\`\`\`sh
quickadui add core
\`\`\`

See the [QuickadUI repository](https://github.com/AdouaniHoussemKhalil/quickadui-)
for the full component catalog.
`;
}

export interface ScaffoldFile {
  readonly path: string;
  readonly contents: string;
}

/**
 * All the files `init` writes, as pure (relative path, contents) pairs —
 * `commands/init.ts` is the only place that actually touches the
 * filesystem, writing each of these under the target directory.
 */
export function renderScaffoldFiles(projectName: string): readonly ScaffoldFile[] {
  return [
    { path: "package.json", contents: renderPackageJson(projectName) },
    { path: "vite.config.ts", contents: renderViteConfig() },
    { path: "tsconfig.json", contents: renderTsconfigJson() },
    { path: "index.html", contents: renderIndexHtml(projectName) },
    { path: "README.md", contents: renderReadme(projectName) },
    { path: ".gitignore", contents: renderGitignore() },
    { path: "src/main.tsx", contents: renderMainTsx() },
    { path: "src/App.tsx", contents: renderAppTsx(projectName) },
    { path: "src/index.css", contents: renderIndexCss() },
    { path: "src/vite-env.d.ts", contents: renderViteEnvDts() },
  ];
}
