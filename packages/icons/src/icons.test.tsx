import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import type { IconProps } from "./icon";
import * as Icons from "./icons";

type IconComponent = (props: IconProps) => ReactElement;

// `icons.tsx` exports nothing but the curated *Icon wrapper components, so
// this is exactly that set — no filtering needed.
const entries = Object.entries(Icons) as [string, IconComponent][];

describe("icons", () => {
  it("exports more than twenty curated glyphs, each under a unique *Icon name", () => {
    expect(entries.length).toBeGreaterThan(20);
    expect(entries.every(([name]) => name.endsWith("Icon"))).toBe(true);
    expect(new Set(entries.map(([name]) => name)).size).toBe(entries.length);
  });

  it.each(entries)(
    "%s forwards className and size to its underlying Lucide primitive",
    (_name, Icon) => {
      const element = Icon({ className: "text-accent-9", size: 16 });
      expect(element.props).toMatchObject({ className: "text-accent-9", size: 16 });
    },
  );
});
