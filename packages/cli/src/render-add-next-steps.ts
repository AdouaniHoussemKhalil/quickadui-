import type { PackageManager } from "./args.js";
import type { QuickaduiPackageDefinition } from "./packages.js";
import { renderSourceDirective } from "./source-directive.js";

/**
 * Renders the "what to do next" text `add` prints after writing the
 * consumer's package.json. `add` only ever edits package.json — it never
 * touches the consumer's own `index.css`, since guessing where an
 * existing `@import`/`@theme` block ends and rewriting an unfamiliar file
 * risks corrupting it. Instead this tells the person exactly which line
 * to paste in, for every installed package that needs one.
 */
const THEME_PACKAGE_NAME = "@quickadui/theme";

export function renderAddNextSteps(
  packages: readonly QuickaduiPackageDefinition[],
  packageManager: PackageManager,
): string {
  const installCommand = packageManager === "yarn" ? "yarn" : `${packageManager} install`;
  const sourceLines = packages
    .filter((pkg) => pkg.needsSourceDirective)
    .map((pkg) => renderSourceDirective(pkg.name));
  const hasTheme = packages.some((pkg) => pkg.name === THEME_PACKAGE_NAME);
  // Every component package with `needsSourceDirective: true` renders
  // using semantic color classes (bg-accent-9, border-neutral-6, ...) —
  // see @quickadui/theme's own README. Those classes only generate real
  // CSS once theme's two generated stylesheets are imported, but that's
  // a CSS-only relationship, invisible anywhere in the real package.json
  // dependency graphs this registry otherwise mirrors — so it's handled
  // here, in the printed instructions, rather than by (dishonestly)
  // adding "@quickadui/theme" to core/data/forms/etc.'s
  // quickaduiDependencies above.
  const themeImportLines = hasTheme
    ? ['@import "@quickadui/theme/tokens.css";', '@import "@quickadui/theme/tailwind-theme.css";']
    : [];
  const cssLines = [...themeImportLines, ...sourceLines];

  const lines: string[] = [];
  lines.push(`Added ${packages.map((pkg) => pkg.name).join(", ")} to package.json.`);
  lines.push("");
  lines.push("Next steps:");
  lines.push(`  1. Run \`${installCommand}\` to fetch the new dependencies.`);

  if (cssLines.length > 0) {
    lines.push(
      '  2. Add the following line(s) to your CSS entry point (after your `@import "tailwindcss";`):',
    );
    lines.push("");
    for (const line of cssLines) {
      lines.push(`     ${line}`);
    }
    lines.push("");
    if (themeImportLines.length > 0) {
      lines.push("     Without the @quickadui/theme lines, semantic color classes (bg-accent-9,");
      lines.push(
        "     border-neutral-6, ...) generate no CSS at all — components render with no color.",
      );
    }
    if (sourceLines.length > 0) {
      lines.push(
        "     Without the @source line(s), Tailwind won't see these packages' own classes",
      );
      lines.push(
        "     once installed into node_modules, and their components will render unstyled.",
      );
      lines.push("");
      lines.push(
        "     These paths assume your CSS entry point is `src/index.css` (the `quickadui init`",
      );
      lines.push(
        "     default) — Tailwind resolves `@source` relative to the stylesheet it's written in,",
      );
      lines.push(
        "     not your project root, so adjust the `../` prefix if yours lives somewhere else.",
      );
    }
    if (themeImportLines.length > 0) {
      lines.push("");
      lines.push(
        "     @quickadui/theme's own stylesheets only recolor components that carry their own",
      );
      lines.push(
        "     `bg-neutral-*`/`text-neutral-*` classes (Navbar, Sidebar, ...) — your page's plain",
      );
      lines.push(
        "     `<body>` background stays whatever the browser default is otherwise. Add this too:",
      );
      lines.push("");
      lines.push("     @layer base {");
      lines.push("       body {");
      lines.push("         @apply bg-neutral-1 text-neutral-12;");
      lines.push("       }");
      lines.push("     }");
    }
  } else {
    // Only reachable when hasTheme is false and no package needs @source —
    // i.e. there's genuinely nothing CSS-related to mention, so the
    // original wording (matched by render-add-next-steps.test.ts) still
    // applies as-is.
    lines.push(
      "  2. No `@source` lines needed — none of the installed packages ship colored, styled components.",
    );
  }

  if (!hasTheme && packages.some((pkg) => pkg.needsSourceDirective)) {
    lines.push("");
    lines.push("Heads up: these components use QuickadUI's semantic color classes, which need");
    lines.push(
      "@quickadui/theme's generated CSS to render. Run `quickadui add theme` too, then add",
    );
    lines.push("its two @import lines (same pattern as step 2 above) to your CSS.");
  }

  return lines.join("\n");
}
