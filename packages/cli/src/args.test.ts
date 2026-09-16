import { describe, expect, it } from "vitest";
import { parseArgs } from "./args";

describe("parseArgs", () => {
  it("parses a bare command with no flags", () => {
    const result = parseArgs(["init"]);
    expect(result.command).toBe("init");
    expect(result.positionals).toEqual([]);
    expect(result.help).toBe(false);
    expect(result.force).toBe(false);
  });

  it("parses a command with positional arguments", () => {
    const result = parseArgs(["add", "core", "forms"]);
    expect(result.command).toBe("add");
    expect(result.positionals).toEqual(["core", "forms"]);
  });

  it("recognizes --help and -h", () => {
    expect(parseArgs(["--help"]).help).toBe(true);
    expect(parseArgs(["-h"]).help).toBe(true);
    expect(parseArgs(["init"]).help).toBe(false);
  });

  it("recognizes --force and -f", () => {
    expect(parseArgs(["init", "--force"]).force).toBe(true);
    expect(parseArgs(["init", "-f"]).force).toBe(true);
  });

  it("parses --pm with a valid package manager", () => {
    expect(parseArgs(["add", "core", "--pm", "pnpm"]).packageManager).toBe("pnpm");
  });

  it("ignores --pm with an invalid value", () => {
    expect(parseArgs(["add", "core", "--pm", "bun"]).packageManager).toBeUndefined();
  });

  it("parses --dir and -C", () => {
    expect(parseArgs(["add", "core", "--dir", "/tmp/my-app"]).targetDir).toBe("/tmp/my-app");
    expect(parseArgs(["add", "core", "-C", "/tmp/my-app"]).targetDir).toBe("/tmp/my-app");
  });

  it("returns undefined command and empty positionals for empty argv", () => {
    const result = parseArgs([]);
    expect(result.command).toBeUndefined();
    expect(result.positionals).toEqual([]);
  });

  it("does not treat an unknown flag as a positional", () => {
    const result = parseArgs(["init", "--verbose"]);
    expect(result.positionals).toEqual([]);
  });
});
