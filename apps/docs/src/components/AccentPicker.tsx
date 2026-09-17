import { Button } from "@quickadui/core";
import { useTheme } from "@quickadui/theme";
import { useEffect, useState } from "react";

/**
 * Reads the accent family's *currently rendered* color as a `#rrggbb` hex
 * by letting the browser resolve `var(--qa-color-accent-9)` for us —
 * `getComputedStyle` always normalizes a resolved color to `rgb(...)`
 * regardless of how `tokens.css` actually defines the variable, so this
 * keeps working even if `@quickadui/tokens` changes color space later.
 * Only needed to seed the `<input type="color">`'s swatch when nothing is
 * overridden yet; once the user has picked one, `colors.accent` (already a
 * `#RRGGBB` string) is used directly instead.
 */
function readComputedAccent(): string {
  if (typeof document === "undefined") {
    return "#2563eb";
  }
  const probe = document.createElement("span");
  probe.style.color = "var(--qa-color-accent-9)";
  probe.style.display = "none";
  document.body.appendChild(probe);
  const rgb = getComputedStyle(probe).color;
  document.body.removeChild(probe);
  const match = rgb.match(/(\d+),\s*(\d+),\s*(\d+)/);
  if (!match) {
    return "#2563eb";
  }
  const [, r, g, b] = match;
  const toHex = (channel: string) => Number(channel).toString(16).padStart(2, "0");
  return `#${toHex(r ?? "0")}${toHex(g ?? "0")}${toHex(b ?? "0")}`;
}

/**
 * Accent-only color picker, rendered next to the light/dark/system
 * `ThemeToggle` in the docs header — the user-confirmed scope for this
 * round deliberately covers just the accent family, not the other four
 * color families (`neutral`/`success`/`warning`/`danger`), mirroring
 * `apps/playground`'s own `AccentPicker`. A native `<input type="color">`
 * bound to `useTheme()`'s `colors.accent`, calling `setColor("accent",
 * hex)` on every change; the "Reset" button only appears once the accent
 * is actually overridden, and calls `resetColor("accent")`.
 */
export function AccentPicker() {
  const { colors, resolvedTheme, setColor, resetColor } = useTheme();
  const overridden = colors.accent !== undefined;
  const [swatch, setSwatch] = useState<string>(() => colors.accent ?? readComputedAccent());

  // Keep the swatch in sync: reflect the override directly when one exists,
  // otherwise re-read the computed build-time color — needed because the
  // light/dark scale differs, so toggling `resolvedTheme` changes what an
  // unoverridden accent actually renders as.
  useEffect(() => {
    setSwatch(colors.accent ?? readComputedAccent());
  }, [colors.accent, resolvedTheme]);

  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={swatch}
        // Consumed only internally (`.value`, never forwarded onward) — a
        // minimal structural type is correct and safe here, same pattern
        // `@quickadui/charts`' chart components use for their own pointer
        // handlers.
        onChange={(event: { target: { value: string } }) => setColor("accent", event.target.value)}
        aria-label="Accent color"
        className="h-7 w-7 cursor-pointer rounded-md border border-neutral-6 bg-transparent p-0"
      />
      {overridden && (
        <Button type="button" variant="ghost" size="sm" onClick={() => resetColor("accent")}>
          Reset
        </Button>
      )}
    </div>
  );
}
