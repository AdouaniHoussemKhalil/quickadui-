import { describe, expect, it } from "vitest";
import {
  renderAuthClient,
  renderAuthFiles,
  renderAuthProvider,
  renderLoginPage,
  renderProfilePage,
} from "./auth-templates";

const options = { apiBase: "https://dummyjson.com" };

describe("renderAuthClient", () => {
  it("embeds the given api base and exposes login/getMe", () => {
    const file = renderAuthClient(options);
    expect(file.path).toBe("src/auth/auth-client.ts");
    expect(file.contents).toContain('const API_BASE = "https://dummyjson.com";');
    expect(file.contents).toContain("export async function login(");
    expect(file.contents).toContain("export async function getMe(");
    expect(file.contents).toContain("/auth/login");
    expect(file.contents).toContain("/auth/me");
    expect(file.contents).not.toContain("export function logout(");
  });
});

describe("renderAuthProvider", () => {
  it("exposes AuthProvider and useAuth, storing the token in localStorage", () => {
    const file = renderAuthProvider();
    expect(file.path).toBe("src/auth/AuthProvider.tsx");
    expect(file.contents).toContain("export function AuthProvider(");
    expect(file.contents).toContain("export function useAuth(");
    expect(file.contents).toContain('"quickadui-auth-token"');
    expect(file.contents).toContain("useAuth must be used within an <AuthProvider>");
  });
});

describe("renderLoginPage", () => {
  it("mentions the DummyJSON demo credentials", () => {
    const file = renderLoginPage();
    expect(file.path).toBe("src/pages/LoginPage.tsx");
    expect(file.contents).toContain("emilys");
    expect(file.contents).toContain("emilyspass");
    expect(file.contents).toContain("export function LoginPage()");
  });
});

describe("renderProfilePage", () => {
  it("renders a logout button wired to useAuth()", () => {
    const file = renderProfilePage();
    expect(file.path).toBe("src/pages/ProfilePage.tsx");
    expect(file.contents).toContain("export function ProfilePage()");
    expect(file.contents).toContain("onClick={logout}");
  });
});

describe("renderAuthFiles", () => {
  it("returns all four files with distinct paths", () => {
    const files = renderAuthFiles(options);
    const paths = files.map((file) => file.path);
    expect(paths).toEqual([
      "src/auth/auth-client.ts",
      "src/auth/AuthProvider.tsx",
      "src/pages/LoginPage.tsx",
      "src/pages/ProfilePage.tsx",
    ]);
    expect(new Set(paths).size).toBe(paths.length);
  });
});
