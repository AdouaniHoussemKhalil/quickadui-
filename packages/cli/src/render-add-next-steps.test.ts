import { describe, expect, it } from "vitest";
import { resolveDependencyClosure } from "./packages";
import { renderAddNextSteps } from "./render-add-next-steps";

describe("renderAddNextSteps", () => {
  it("names every installed package", () => {
    const packages = resolveDependencyClosure(["core"]);
    const text = renderAddNextSteps(packages, "npm");
    expect(text).toContain("@quickadui/core");
    expect(text).toContain("@quickadui/primitives");
    expect(text).toContain("@quickadui/utils");
  });

  it("uses the right install command per package manager", () => {
    const packages = resolveDependencyClosure(["tokens"]);
    expect(renderAddNextSteps(packages, "npm")).toContain("npm install");
    expect(renderAddNextSteps(packages, "pnpm")).toContain("pnpm install");
    expect(renderAddNextSteps(packages, "yarn")).toContain("`yarn`");
  });

  it("lists an @source line for every package that needs one, relative to src/index.css", () => {
    const packages = resolveDependencyClosure(["core"]);
    const text = renderAddNextSteps(packages, "npm");
    // `../node_modules`, not `./node_modules`: @source resolves relative to
    // the stylesheet it's written in, and `quickadui init` scaffolds that
    // stylesheet at `src/index.css` — one directory below the project root
    // where `node_modules` actually lives. Getting this wrong doesn't
    // error, it just silently drops every class the package ships, so
    // every component from it renders unstyled with no error pointing at
    // the cause (confirmed by direct inspection of a real project).
    expect(text).toContain('@source "../node_modules/@quickadui/core";');
    expect(text).toContain('@source "../node_modules/@quickadui/primitives";');
    expect(text).not.toContain('@source "./node_modules/');
  });

  it("says no @source lines are needed when none of the packages require one", () => {
    const packages = resolveDependencyClosure(["tokens"]);
    const text = renderAddNextSteps(packages, "npm");
    expect(text).toContain("No `@source` lines needed");
    expect(text).not.toContain('@source "../node_modules/');
  });

  it("tells the person to give <body> a theme-aware background/text color when theme is installed", () => {
    // @quickadui/theme's stylesheets only make bg-neutral-*/text-neutral-*
    // etc. resolve to real colors — they don't apply any of those classes
    // to anything themselves. Every @quickadui/shell component (Navbar,
    // Sidebar, ...) carries its own bg-neutral-1, so those go dark/light
    // correctly, but a plain <body> with no such class stays the browser's
    // default white forever, regardless of theme — confirmed by direct
    // inspection of a real project stuck exactly this way in dark mode
    // (near-invisible dark-on-light text outside the shell chrome).
    const packages = resolveDependencyClosure(["theme"]);
    const text = renderAddNextSteps(packages, "npm");
    expect(text).toContain("@apply bg-neutral-1 text-neutral-12;");
  });

  it("does not mention a <body> rule when theme isn't installed", () => {
    const packages = resolveDependencyClosure(["core"]);
    const text = renderAddNextSteps(packages, "npm");
    expect(text).not.toContain("@apply bg-neutral-1 text-neutral-12;");
  });
});
