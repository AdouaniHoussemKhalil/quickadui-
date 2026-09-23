import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { discoverFeatures } from "./discover-features";

let projectDir: string | undefined;

afterEach(() => {
  if (projectDir) {
    rmSync(projectDir, { recursive: true, force: true });
    projectDir = undefined;
  }
});

function makeProject(): string {
  const dir = mkdtempSync(join(tmpdir(), "quickadui-discover-test-"));
  projectDir = dir;
  return dir;
}

function writeResourcePage(dir: string, kebab: string, pascal: string, endpoint: string): void {
  const featureDir = join(dir, "src", "pages", kebab);
  mkdirSync(featureDir, { recursive: true });
  writeFileSync(
    join(featureDir, `${pascal}ListPage.tsx`),
    `export function ${pascal}ListPage() {\n  return <a href="#/${endpoint}/new">New</a>;\n}\n`,
    "utf8",
  );
  writeFileSync(
    join(featureDir, `${pascal}FormPage.tsx`),
    `export function ${pascal}FormPage() {}\n`,
    "utf8",
  );
}

describe("discoverFeatures", () => {
  it("returns [] when nothing was generated yet", () => {
    const dir = makeProject();
    expect(discoverFeatures(dir)).toEqual([]);
  });

  it("returns [] when src/pages doesn't exist at all", () => {
    const dir = makeProject();
    // No mkdirSync at all — the directory genuinely doesn't exist.
    expect(discoverFeatures(dir)).toEqual([]);
  });

  it("finds a generated resource, deriving pascal/camel/kebab/endpoint/label", () => {
    const dir = makeProject();
    writeResourcePage(dir, "product", "Product", "products");

    const features = discoverFeatures(dir);
    expect(features).toEqual([
      {
        kind: "resource",
        pascal: "Product",
        camel: "product",
        kebab: "product",
        endpoint: "products",
        label: "Products",
      },
    ]);
  });

  it("recovers a custom --endpoint that differs from the naive plural", () => {
    const dir = makeProject();
    writeResourcePage(dir, "category", "Category", "product-categories");

    const [feature] = discoverFeatures(dir);
    expect(feature).toMatchObject({ endpoint: "product-categories", kebab: "category" });
  });

  it("falls back to the folder's kebab name if the New-button href pattern isn't found", () => {
    const dir = makeProject();
    const featureDir = join(dir, "src", "pages", "widget");
    mkdirSync(featureDir, { recursive: true });
    writeFileSync(
      join(featureDir, "WidgetListPage.tsx"),
      "export function WidgetListPage() { return null; }\n",
      "utf8",
    );

    const [feature] = discoverFeatures(dir);
    expect(feature).toMatchObject({ endpoint: "widget" });
  });

  it("finds login and profile pages, in that order, after any resources", () => {
    const dir = makeProject();
    writeResourcePage(dir, "product", "Product", "products");
    mkdirSync(join(dir, "src", "pages"), { recursive: true });
    writeFileSync(
      join(dir, "src", "pages", "LoginPage.tsx"),
      "export function LoginPage() {}\n",
      "utf8",
    );
    writeFileSync(
      join(dir, "src", "pages", "ProfilePage.tsx"),
      "export function ProfilePage() {}\n",
      "utf8",
    );

    const features = discoverFeatures(dir);
    expect(features.map((f) => f.kind)).toEqual(["resource", "login", "profile"]);
    expect(features[1]).toEqual({ kind: "login", label: "Login", href: "#/login" });
    expect(features[2]).toEqual({ kind: "profile", label: "Profile", href: "#/profile" });
  });

  it("finds only login when there's no ProfilePage.tsx", () => {
    const dir = makeProject();
    mkdirSync(join(dir, "src", "pages"), { recursive: true });
    writeFileSync(
      join(dir, "src", "pages", "LoginPage.tsx"),
      "export function LoginPage() {}\n",
      "utf8",
    );

    expect(discoverFeatures(dir).map((f) => f.kind)).toEqual(["login"]);
  });

  it("ignores a pages subfolder with no *ListPage.tsx file in it", () => {
    const dir = makeProject();
    const emptyDir = join(dir, "src", "pages", "empty");
    mkdirSync(emptyDir, { recursive: true });
    writeFileSync(join(emptyDir, "notes.txt"), "hi", "utf8");

    expect(discoverFeatures(dir)).toEqual([]);
  });
});
