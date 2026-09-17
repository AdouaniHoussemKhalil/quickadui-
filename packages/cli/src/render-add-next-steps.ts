import type { PackageManager } from "./args.js";
import type { QuickaduiPackageDefinition } from "./packages.js";

/**
 * Renders the "what to do next" text `add` prints after writing the
 * consumer's package.json. `add` only ever edits package.json — it never
 * touches the consumer's own `index.css`, since guessing where an
 * existing `@import`/`@theme` block ends and rewriting an unfamiliar file
 * risks corrupting it. Instead this tells the person exactly which line
 * to paste in, for every installed package that needs one.
 */
export function renderAddNextSteps(
  packages: readonly QuickaduiPackageDefinition[],
  packageManager: PackageManager,
): string {
  const installCommand = packageManager === "yarn" ? "yarn" : `${packageManager} install`;
  const sourceLines = packages
    .filter((pkg) => pkg.needsSourceDirective)
    .map((pkg) => `@source "./node_modules/${pkg.name}";`);

  const lines: string[] = [];
  lines.push(`Added ${packages.map((pkg) => pkg.name).join(", ")} to package.json.`);
  lines.push("");
  lines.push("Next steps:");
  lines.push(`  1. Run \`${installCommand}\` to fetch the new dependencies.`);

  if (sourceLines.length > 0) {
    lines.push(
      '  2. Add the following line(s) to your CSS entry point (after your `@import "tailwindcss";`):',
    );
    lines.push("");
    for (const line of sourceLines) {
      lines.push(`     ${line}`);
    }
    lines.push("");
    lines.push("     Without this, Tailwind won't see these packages' classes once they're");
    lines.push("     installed into node_modules, and their components will render unstyled.");
  } else {
    lines.push(
      "  2. No `@source` lines needed — none of the installed packages hardcode Tailwind classes.",
    );
  }

  return lines.join("\n");
}
