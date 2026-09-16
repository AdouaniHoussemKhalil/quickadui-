import type { ReactNode } from "react";

/**
 * A small framework-agnostic store for "what toasts are currently
 * showing" — the piece Radix's `Toast` primitive deliberately doesn't
 * provide (see `@quickadui/primitives`' `toast.tsx`). Plain module-level
 * state plus a subscriber set, read via React's `useSyncExternalStore`
 * in `use-toast.ts` — the same shape every Radix-Toast-based library
 * (sonner, shadcn/ui's toast, ...) ends up with, because Radix only
 * renders one toast; tracking the list of them is left to you.
 */
export interface ToastData {
  id: string;
  title?: ReactNode;
  description?: ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
  /** Milliseconds before auto-dismiss. Falls through to `ToastProvider`'s own default (5000ms) when unset. */
  duration?: number;
  /** Label for an optional action button — also doubles as its accessible `altText`, so the two can never drift apart. */
  actionLabel?: string;
  onAction?: () => void;
}

export type ToastOptions = Omit<ToastData, "id">;

type Listener = () => void;

let toasts: ToastData[] = [];
const listeners = new Set<Listener>();

function emitChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

/** For `useSyncExternalStore` — registers `listener`, returns the unsubscribe function. */
export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** For `useSyncExternalStore` — must return the exact same reference until the list actually changes, which is why every mutation below replaces `toasts` wholesale rather than mutating it in place. */
export function getSnapshot(): ToastData[] {
  return toasts;
}

let idCounter = 0;

/**
 * A plain incrementing counter, not `crypto.randomUUID()` — deterministic
 * and trivially testable, and toast IDs never need to be globally unique
 * outside a single page session (unlike, say, a database primary key).
 */
function generateId(): string {
  idCounter += 1;
  return `toast-${idCounter}`;
}

/** Adds a toast to the store and returns its id (pass to `dismissToast` to remove it early). `Toaster` (in `toaster.tsx`) is what actually renders the list this appends to. */
export function toast(options: ToastOptions): string {
  const id = generateId();
  toasts = [...toasts, { id, ...options }];
  emitChange();
  return id;
}

export function dismissToast(id: string): void {
  toasts = toasts.filter((t) => t.id !== id);
  emitChange();
}

/** Test-only — resets all module-level state between test cases. Not exported from the package's public `index.ts`. */
export function _resetToastStoreForTests(): void {
  toasts = [];
  idCounter = 0;
  listeners.clear();
}
