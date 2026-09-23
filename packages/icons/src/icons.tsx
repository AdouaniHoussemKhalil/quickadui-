"use client";

import {
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  CircleAlert,
  CircleCheck,
  CircleX,
  Clock,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Info,
  LoaderCircle,
  Menu,
  Minus,
  MoreHorizontal,
  MoreVertical,
  Plus,
  Search,
  Settings,
  Trash2,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  User,
  X,
} from "lucide-react";
import type { IconProps } from "./icon";

/**
 * Curated Lucide icons re-exported under stable QuickadUI names — a
 * consumer never imports `lucide-react` directly (same reasoning as
 * `@quickadui/primitives` never letting consumers import `radix-ui`
 * directly). Every part below is a real function component over
 * `IconProps` rather than `export const X = LucideX` — Lucide's own
 * types (`LucideIcon`/`LucideProps`) are publicly nameable, so a raw
 * value re-export wouldn't actually hit the TS4023 declaration-emit bug
 * `@quickadui/primitives` ran into (see that package's README) — but the
 * wrapper function keeps every QuickadUI package following the same rule
 * without needing to remember which vendor types happen to be exported.
 *
 * This list grows incrementally as components need new icons — it isn't
 * meant to cover all ~1,600 Lucide icons, just the ones QuickadUI's own
 * components use plus the handful of generically useful ones (search,
 * menu, user, settings, ...) most consumers reach for immediately.
 */
export function ChevronDownIcon(props: IconProps) {
  return <ChevronDown {...props} />;
}

export function ChevronUpIcon(props: IconProps) {
  return <ChevronUp {...props} />;
}

export function ChevronLeftIcon(props: IconProps) {
  return <ChevronLeft {...props} />;
}

export function ChevronRightIcon(props: IconProps) {
  return <ChevronRight {...props} />;
}

export function CheckIcon(props: IconProps) {
  return <Check {...props} />;
}

export function CloseIcon(props: IconProps) {
  return <X {...props} />;
}

/** `@quickadui/core`'s `CopyButton`/`CopyField` clipboard-copy affordance. */
export function CopyIcon(props: IconProps) {
  return <Copy {...props} />;
}

export function CircleIcon(props: IconProps) {
  return <Circle {...props} />;
}

export function MinusIcon(props: IconProps) {
  return <Minus {...props} />;
}

export function SearchIcon(props: IconProps) {
  return <Search {...props} />;
}

export function MenuIcon(props: IconProps) {
  return <Menu {...props} />;
}

export function MoreHorizontalIcon(props: IconProps) {
  return <MoreHorizontal {...props} />;
}

export function MoreVerticalIcon(props: IconProps) {
  return <MoreVertical {...props} />;
}

export function InfoIcon(props: IconProps) {
  return <Info {...props} />;
}

/** A triangular warning glyph — QuickadUI's `Alert`/form-validation `variant="warning"`. */
export function WarningIcon(props: IconProps) {
  return <TriangleAlert {...props} />;
}

/** A circular warning/error glyph — distinct silhouette from `WarningIcon`, for contexts (toasts, inline field errors) where a triangle reads as "less severe" than a filled circle. */
export function ErrorIcon(props: IconProps) {
  return <CircleAlert {...props} />;
}

export function SuccessIcon(props: IconProps) {
  return <CircleCheck {...props} />;
}

/** A circular "dismiss/failed" glyph — distinct from `CloseIcon` (a bare X, for close buttons) and `ErrorIcon` (a circled exclamation, for validation states). */
export function CancelIcon(props: IconProps) {
  return <CircleX {...props} />;
}

export function EyeIcon(props: IconProps) {
  return <Eye {...props} />;
}

export function EyeOffIcon(props: IconProps) {
  return <EyeOff {...props} />;
}

export function CalendarIcon(props: IconProps) {
  return <Calendar {...props} />;
}

export function ClockIcon(props: IconProps) {
  return <Clock {...props} />;
}

export function UserIcon(props: IconProps) {
  return <User {...props} />;
}

export function SettingsIcon(props: IconProps) {
  return <Settings {...props} />;
}

export function TrashIcon(props: IconProps) {
  return <Trash2 {...props} />;
}

export function PlusIcon(props: IconProps) {
  return <Plus {...props} />;
}

/** Pair with `animate-spin` (see `@quickadui/core`'s `Spinner`, which draws its own inline SVG instead — this is for a spot that just needs a loading glyph inline in text, not the full accessible `Spinner` component). */
export function LoaderIcon(props: IconProps) {
  return <LoaderCircle {...props} />;
}

/** A vertical grip/handle glyph — `@quickadui/shell`'s `Widget` and `@quickadui/data`'s `SortableItem` drag handles, or anywhere else a draggable-item affordance is needed. */
export function GripVerticalIcon(props: IconProps) {
  return <GripVertical {...props} />;
}

/** `@quickadui/charts`' `StatCard` positive-trend indicator. */
export function TrendUpIcon(props: IconProps) {
  return <TrendingUp {...props} />;
}

/** `@quickadui/charts`' `StatCard` negative-trend indicator. */
export function TrendDownIcon(props: IconProps) {
  return <TrendingDown {...props} />;
}
