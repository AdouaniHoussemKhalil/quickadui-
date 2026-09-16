import type { LucideProps } from "lucide-react";

/**
 * The one stable contract every icon in this package follows, whether it
 * wraps a Lucide icon or is a QuickadUI-original glyph drawn by hand (see
 * `logomark.tsx`). Consumers write `<SearchIcon size={16} />` the same way
 * regardless of which one it is — and if QuickadUI ever swaps icon
 * vendors, only this package's internals change (same reasoning as
 * `@quickadui/primitives` wrapping `radix-ui`).
 *
 * Re-exporting `LucideProps` directly (rather than hand-rolling an
 * equivalent shape) is what keeps `size`/`color`/`strokeWidth` etc.
 * available on every icon, Lucide-sourced or not.
 */
export type IconProps = LucideProps;
