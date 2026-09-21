import { describe, expect, it } from "vitest";
import { renderApp } from "./app-shell-templates";
import type { DiscoveredFeature } from "./discover-features";

const productFeature: DiscoveredFeature = {
  kind: "resource",
  pascal: "Product",
  camel: "product",
  kebab: "product",
  endpoint: "products",
  label: "Products",
};
const loginFeature: DiscoveredFeature = { kind: "login", label: "Login", href: "#/login" };
const profileFeature: DiscoveredFeature = { kind: "profile", label: "Profile", href: "#/profile" };

const baseOptions = {
  projectName: "my-app",
  navbar: false,
  sidebar: false,
  footer: false,
  navbarItems: [],
  sidebarItems: [],
  hasAuth: false,
  features: [],
};

describe("renderApp", () => {
  it("writes to src/App.tsx", () => {
    expect(renderApp(baseOptions).path).toBe("src/App.tsx");
  });

  it("exports App as a named export, never default", () => {
    const { contents } = renderApp(baseOptions);
    expect(contents).toContain("export function App()");
    expect(contents).not.toContain("export default");
  });

  it("always wraps in ThemeProvider and includes a theme toggle", () => {
    const { contents } = renderApp(baseOptions);
    expect(contents).toContain("<ThemeProvider>");
    expect(contents).toContain("function ThemeToggle()");
    expect(contents).toContain("useTheme();");
  });

  it("omits the shell import and DashboardLayout entirely when navbar/sidebar/footer are all false", () => {
    const { contents } = renderApp(baseOptions);
    expect(contents).not.toContain("@quickadui/shell");
    expect(contents).not.toContain("DashboardLayout");
  });

  it("wraps in AuthProvider only when hasAuth is true", () => {
    const withoutAuth = renderApp(baseOptions);
    expect(withoutAuth.contents).not.toContain("AuthProvider");

    const withAuth = renderApp({ ...baseOptions, hasAuth: true });
    expect(withAuth.contents).toContain('import { AuthProvider, useAuth } from "./auth/AuthProvider";');
    expect(withAuth.contents).toContain("<AuthProvider>\n        <AuthGate>{content}</AuthGate>\n      </AuthProvider>");
  });

  it("gates content behind an AuthGate (spinner while useAuth().loading) only when hasAuth is true", () => {
    const withoutAuth = renderApp(baseOptions);
    expect(withoutAuth.contents).not.toContain("AuthGate");
    expect(withoutAuth.contents).not.toContain("Spinner");

    const withAuth = renderApp({ ...baseOptions, hasAuth: true });
    expect(withAuth.contents).toContain("function AuthGate({ children }: { children: ReactNode }) {");
    expect(withAuth.contents).toContain("const { loading } = useAuth();");
    expect(withAuth.contents).toContain('import { Button, Spinner } from "@quickadui/core";');
    expect(withAuth.contents).toContain('<Spinner size="lg" label="Loading" />');
    expect(withAuth.contents).toContain('import { type ReactNode, useEffect, useState } from "react";');
  });

  it("includes Navbar-related imports and an AppNavbar function only when navbar is true", () => {
    const withNavbar = renderApp({ ...baseOptions, navbar: true, navbarItems: [{ label: "Home", href: "#/" }] });
    expect(withNavbar.contents).toContain("Navbar,");
    expect(withNavbar.contents).toContain("NavbarBrand,");
    expect(withNavbar.contents).toContain("NavbarContent,");
    expect(withNavbar.contents).toContain("NavbarActions,");
    expect(withNavbar.contents).toContain("function AppNavbar(");
    expect(withNavbar.contents).toContain('<a href="#/">Home</a>');

    expect(renderApp(baseOptions).contents).not.toContain("function AppNavbar(");
  });

  it("includes Sidebar-related imports and an AppSidebar function only when sidebar is true", () => {
    const withSidebar = renderApp({
      ...baseOptions,
      sidebar: true,
      sidebarItems: [{ label: "Products", href: "#/products" }],
    });
    expect(withSidebar.contents).toContain("Sidebar,");
    expect(withSidebar.contents).toContain("SidebarNavItem,");
    expect(withSidebar.contents).toContain("function AppSidebar(");
    expect(withSidebar.contents).toContain('<SidebarNavItem key="#/products" href="#/products"');

    expect(renderApp(baseOptions).contents).not.toContain("function AppSidebar(");
  });

  it("only imports SidebarTrigger, and places it in the navbar brand, when both navbar and sidebar are true", () => {
    const both = renderApp({ ...baseOptions, navbar: true, sidebar: true });
    expect(both.contents).toContain("SidebarTrigger,");
    expect(both.contents).toContain("<SidebarTrigger />");

    const sidebarOnly = renderApp({ ...baseOptions, sidebar: true });
    expect(sidebarOnly.contents).not.toContain("SidebarTrigger");
  });

  it("includes an AppFooter function only when footer is true", () => {
    const withFooter = renderApp({ ...baseOptions, footer: true });
    expect(withFooter.contents).toContain("function AppFooter()");
    expect(withFooter.contents).toContain("Footer,");

    expect(renderApp(baseOptions).contents).not.toContain("function AppFooter(");
  });

  it("uses DashboardLayout when any of navbar/sidebar/footer is true", () => {
    expect(renderApp({ ...baseOptions, footer: true }).contents).toContain("<DashboardLayout");
    expect(renderApp(baseOptions).contents).not.toContain("<DashboardLayout");
  });

  it("generates list/new/edit router cases for a resource feature, importing both its pages", () => {
    const { contents } = renderApp({ ...baseOptions, features: [productFeature] });
    expect(contents).toContain('import { ProductListPage } from "./pages/product/ProductListPage";');
    expect(contents).toContain('import { ProductFormPage } from "./pages/product/ProductFormPage";');
    expect(contents).toContain('if (hash === "#/products") {');
    expect(contents).toContain('if (hash === "#/products/new") {');
    expect(contents).toContain('hash.startsWith("#/products/") && hash.endsWith("/edit")');
    expect(contents).toContain("<ProductFormPage productId={productId} />");
  });

  it("generates a login router case and import when a login feature is present", () => {
    const { contents } = renderApp({ ...baseOptions, features: [loginFeature] });
    expect(contents).toContain('import { LoginPage } from "./pages/LoginPage";');
    expect(contents).toContain('if (hash === "#/login") {');
    expect(contents).toContain("<LoginPage />");
  });

  it("generates a profile router case and import when a profile feature is present", () => {
    const { contents } = renderApp({ ...baseOptions, features: [profileFeature] });
    expect(contents).toContain('import { ProfilePage } from "./pages/ProfilePage";');
    expect(contents).toContain('if (hash === "#/profile") {');
    expect(contents).toContain("<ProfilePage />");
  });

  it("falls back to a HomePage placeholder when there are no features at all", () => {
    const { contents } = renderApp(baseOptions);
    expect(contents).toContain("function HomePage()");
    expect(contents).toContain("return <HomePage />;");
  });

  it("shows a standalone theme-toggle row when navbar is false, instead of relying on NavbarActions", () => {
    const { contents } = renderApp(baseOptions);
    expect(contents).toContain("<ThemeToggle />");
    // No NavbarActions import at all when there's no navbar.
    expect(contents).not.toContain("NavbarActions");
  });

  it("renders a navbar item's icon next to its label, and imports it from @quickadui/icons", () => {
    const { contents } = renderApp({
      ...baseOptions,
      navbar: true,
      navbarItems: [{ label: "Home", href: "#/", icon: "Home" }],
    });
    expect(contents).toContain('import {\n  HomeIcon,\n} from "@quickadui/icons";');
    expect(contents).toContain('<a href="#/"><HomeIcon size={16} aria-hidden />Home</a>');
  });

  it("passes a sidebar item's icon as SidebarNavItem's icon prop", () => {
    const { contents } = renderApp({
      ...baseOptions,
      sidebar: true,
      sidebarItems: [{ label: "Products", href: "#/products", icon: "Package" }],
    });
    expect(contents).toContain('import {\n  PackageIcon,\n} from "@quickadui/icons";');
    expect(contents).toContain(
      '<SidebarNavItem key="#/products" href="#/products" active={hash === "#/products"} icon={<PackageIcon size={16} aria-hidden />}>',
    );
  });

  it("dedupes and sorts icon names shared across navbar and sidebar items", () => {
    const { contents } = renderApp({
      ...baseOptions,
      navbar: true,
      sidebar: true,
      navbarItems: [{ label: "Home", href: "#/", icon: "Home" }],
      sidebarItems: [
        { label: "Products", href: "#/products", icon: "Package" },
        { label: "Home", href: "#/", icon: "Home" },
      ],
    });
    expect(contents).toContain('import {\n  HomeIcon,\n  PackageIcon,\n} from "@quickadui/icons";');
  });

  it("omits the @quickadui/icons import entirely when no rendered item has an icon", () => {
    const { contents } = renderApp({
      ...baseOptions,
      navbar: true,
      navbarItems: [{ label: "Home", href: "#/" }],
    });
    expect(contents).not.toContain("@quickadui/icons");
  });

  it("ignores an icon on an item belonging to a disabled section (sidebar items when sidebar is false)", () => {
    const { contents } = renderApp({
      ...baseOptions,
      navbar: true,
      navbarItems: [{ label: "Home", href: "#/" }],
      sidebar: false,
      sidebarItems: [{ label: "Products", href: "#/products", icon: "Package" }],
    });
    expect(contents).not.toContain("@quickadui/icons");
  });
});

describe("renderApp — theme", () => {
  it("stays <ThemeProvider> unchanged when neither defaultTheme nor defaultColors is set", () => {
    const { contents } = renderApp(baseOptions);
    expect(contents).toContain("<ThemeProvider>");
    expect(contents).not.toContain("defaultTheme=");
    expect(contents).not.toContain("defaultColors=");
  });

  it("renders a defaultTheme prop alone as a multi-line opening tag", () => {
    const { contents } = renderApp({ ...baseOptions, defaultTheme: "dark" });
    expect(contents).toContain('<ThemeProvider\n      defaultTheme="dark"\n    >');
    expect(contents).not.toContain("defaultColors=");
  });

  it("renders a defaultColors prop alone, only including the families that were set", () => {
    const { contents } = renderApp({
      ...baseOptions,
      defaultColors: { accent: "#2563EB", danger: "#B23A2B" },
    });
    expect(contents).toContain(
      '<ThemeProvider\n      defaultColors={{ accent: "#2563EB", danger: "#B23A2B" }}\n    >',
    );
    expect(contents).not.toContain("defaultTheme=");
  });

  it("orders defaultColors families as accent, neutral, success, warning, danger regardless of input order", () => {
    const { contents } = renderApp({
      ...baseOptions,
      defaultColors: { danger: "#B23A2B", accent: "#2563EB", success: "#1A7F5A" },
    });
    expect(contents).toContain(
      'defaultColors={{ accent: "#2563EB", success: "#1A7F5A", danger: "#B23A2B" }}',
    );
  });

  it("renders both defaultTheme and defaultColors together, defaultTheme first", () => {
    const { contents } = renderApp({
      ...baseOptions,
      defaultTheme: "light",
      defaultColors: { accent: "#2563EB" },
    });
    expect(contents).toContain(
      '<ThemeProvider\n      defaultTheme="light"\n      defaultColors={{ accent: "#2563EB" }}\n    >',
    );
  });

  it("mounts <Toaster /> and imports it only when needsToaster is true", () => {
    const withToaster = renderApp({ ...baseOptions, needsToaster: true });
    expect(withToaster.contents).toContain('import { Toaster } from "@quickadui/overlays";');
    expect(withToaster.contents).toContain("{content}\n      <Toaster />\n    </ThemeProvider>");

    const withoutToaster = renderApp(baseOptions);
    expect(withoutToaster.contents).not.toContain("@quickadui/overlays");
    expect(withoutToaster.contents).not.toContain("<Toaster");
  });

  it("mounts <Toaster /> after AuthProvider's closing tag, not inside it, when both auth and toaster are on", () => {
    const { contents } = renderApp({ ...baseOptions, hasAuth: true, needsToaster: true });
    expect(contents).toContain(
      "<AuthProvider>\n        <AuthGate>{content}</AuthGate>\n      </AuthProvider>\n      <Toaster />\n    </ThemeProvider>",
    );
  });
});

describe("renderApp — dashboard", () => {
  it("adds no dashboard router case or import when dashboardRoute is unset", () => {
    const { contents } = renderApp(baseOptions);
    expect(contents).not.toContain("DashboardPage");
  });

  it("imports DashboardPage and adds a router case at the given route when dashboardRoute is set", () => {
    const { contents } = renderApp({ ...baseOptions, dashboardRoute: "#/" });
    expect(contents).toContain('import { DashboardPage } from "./pages/DashboardPage";');
    expect(contents).toContain('if (hash === "#/") {\n    return <DashboardPage />;\n  }');
  });

  it("uses a custom route, not just the default #/, when one is given", () => {
    const { contents } = renderApp({ ...baseOptions, dashboardRoute: "#/dashboard" });
    expect(contents).toContain('if (hash === "#/dashboard") {\n    return <DashboardPage />;\n  }');
  });

  it("puts the dashboard router case before any resource/login/profile cases", () => {
    const { contents } = renderApp({
      ...baseOptions,
      dashboardRoute: "#/",
      features: [productFeature],
    });
    const dashboardIndex = contents.indexOf('if (hash === "#/") {\n    return <DashboardPage />;');
    const productIndex = contents.indexOf('if (hash === "#/products")');
    expect(dashboardIndex).toBeGreaterThan(-1);
    expect(productIndex).toBeGreaterThan(dashboardIndex);
  });
});

describe("renderApp — navbar/sidebar brand and logo", () => {
  it("defaults both navbar and sidebar brand slots to projectName as a quote-safe expression, not raw JSX text", () => {
    const navOnly = renderApp({ ...baseOptions, navbar: true });
    expect(navOnly.contents).toContain('<NavbarBrand>\n        {"my-app"}\n      </NavbarBrand>');

    const sidebarOnly = renderApp({ ...baseOptions, sidebar: true });
    expect(sidebarOnly.contents).toContain('<SidebarHeader>{"my-app"}</SidebarHeader>');
  });

  it("uses navbarBrand/sidebarBrand text over projectName when set, independently", () => {
    const { contents } = renderApp({
      ...baseOptions,
      navbar: true,
      sidebar: true,
      navbarBrand: "My Shop",
      sidebarBrand: "My Shop (sidebar)",
    });
    expect(contents).toContain('{"My Shop"}');
    expect(contents).toContain('{"My Shop (sidebar)"}');
    expect(contents).not.toContain('{"my-app"}');
  });

  it("renders an <img> instead of text when navbarLogo/sidebarLogo is set, using brand (or projectName) as alt text", () => {
    const { contents } = renderApp({
      ...baseOptions,
      navbar: true,
      sidebar: true,
      navbarLogo: "/logo.svg",
      sidebarBrand: "My Shop",
      sidebarLogo: "https://example.com/logo.png",
    });
    expect(contents).toContain('<img src={"/logo.svg"} alt={"my-app"} className="h-6 w-auto" />');
    expect(contents).toContain('<img src={"https://example.com/logo.png"} alt={"My Shop"} className="h-6 w-auto" />');
  });

  it("escapes a brand/project name containing quotes safely", () => {
    const { contents } = renderApp({ ...baseOptions, navbar: true, navbarBrand: 'Say "hi"' });
    expect(contents).toContain('{"Say \\"hi\\""}');
  });
});
