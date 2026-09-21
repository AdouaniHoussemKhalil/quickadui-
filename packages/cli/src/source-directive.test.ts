import { describe, expect, it } from "vitest";
import { renderSourceDirective } from "./source-directive";

describe("renderSourceDirective", () => {
  it("points at ../node_modules, not ./node_modules", () => {
    // `quickadui init` scaffolds the CSS entry point at `src/index.css`,
    // one directory below the project root where `node_modules` actually
    // lives. Tailwind resolves `@source` relative to the stylesheet it's
    // written in, so `./node_modules/...` here would silently resolve to
    // the nonexistent `src/node_modules/...` — no error, just every class
    // from the package quietly missing from the generated CSS. This was a
    // real, previously-shipped bug: confirmed by direct inspection of a
    // real scaffolded+`add`ed project where every `@quickadui/shell`
    // component rendered completely unstyled because of exactly this.
    expect(renderSourceDirective("@quickadui/shell")).toBe(
      '@source "../node_modules/@quickadui/shell";',
    );
  });

  it("works for any package name, not just @quickadui/*", () => {
    expect(renderSourceDirective("some-other-package")).toBe(
      '@source "../node_modules/some-other-package";',
    );
  });
});
