import { describe, expect, it } from "vitest";
import { renderIndexCss, renderPackageJson, renderScaffoldFiles, renderTsconfigJson } from "./templates";

describe("renderPackageJson", () => {
  it("produces valid JSON with the given project name", () => {
    const parsed = JSON.parse(renderPackageJson("my-app"));
    expect(parsed.name).toBe("my-app");
    expect(parsed.dependencies.react).toBe("^19.0.0");
    expect(parsed.devDependencies.vite).toBe("^8.3.0");
    expect(parsed.devDependencies.tailwindcss).toBe("^4.3.0");
    expect(parsed.devDependencies.typescript).toBe("^7.0.0");
  });
});

describe("renderTsconfigJson", () => {
  it("produces valid JSON with strict mode on", () => {
    const parsed = JSON.parse(renderTsconfigJson());
    expect(parsed.compilerOptions.strict).toBe(true);
  });
});

describe("renderIndexCss", () => {
  it("imports tailwindcss", () => {
    expect(renderIndexCss()).toContain('@import "tailwindcss";');
  });
});

describe("renderScaffoldFiles", () => {
  it("includes every expected file exactly once", () => {
    const files = renderScaffoldFiles("my-app");
    const paths = files.map((file) => file.path);
    expect(paths).toEqual([
      "package.json",
      "vite.config.ts",
      "tsconfig.json",
      "index.html",
      "README.md",
      ".gitignore",
      "src/main.tsx",
      "src/App.tsx",
      "src/index.css",
    ]);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("gives every file non-empty contents", () => {
    for (const file of renderScaffoldFiles("my-app")) {
      expect(file.contents.length).toBeGreaterThan(0);
    }
  });
});
