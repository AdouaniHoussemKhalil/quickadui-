import type { ExternalDependency, QuickaduiPackageDefinition } from "./packages.js";

/**
 * Compares two `^x.y.z` ranges and returns whichever is higher. Returns
 * `a` unchanged for anything that isn't a plain `^x.y.z` string (a
 * compound range like zod's `"^3.25.0 || ^4.0.0"`, or `">=18"`) — this
 * only exists to resolve the one real conflict in the registry
 * (`@quickadui/utils` wants `tailwind-merge@^3.6.0`, `@quickadui/layout`
 * wants `^2.5.0`), not to be a general semver range resolver.
 */
export function pickHigherRange(a: string, b: string): string {
  const parsedA = parseCaretVersion(a);
  const parsedB = parseCaretVersion(b);
  if (!parsedA || !parsedB) {
    return a;
  }
  for (let i = 0; i < 3; i++) {
    const partA = parsedA[i] as number;
    const partB = parsedB[i] as number;
    if (partA !== partB) {
      return partA > partB ? a : b;
    }
  }
  return a;
}

function parseCaretVersion(range: string): [number, number, number] | null {
  const match = /^\^(\d+)\.(\d+)\.(\d+)$/.exec(range);
  if (!match) {
    return null;
  }
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/**
 * Flattens the external (non-QuickadUI) dependencies of a set of resolved
 * packages into one de-duplicated list, in first-seen order. When two
 * packages disagree on the range for the same dependency name, the
 * higher `^x.y.z` range wins (see `pickHigherRange`).
 */
export function mergeExternalDependencies(
  packages: readonly QuickaduiPackageDefinition[],
): ExternalDependency[] {
  const order: string[] = [];
  const ranges = new Map<string, string>();

  for (const pkg of packages) {
    for (const dep of pkg.externalDependencies) {
      const existing = ranges.get(dep.name);
      if (existing === undefined) {
        order.push(dep.name);
        ranges.set(dep.name, dep.range);
      } else {
        ranges.set(dep.name, pickHigherRange(existing, dep.range));
      }
    }
  }

  return order.map((name) => ({ name, range: ranges.get(name) as string }));
}
