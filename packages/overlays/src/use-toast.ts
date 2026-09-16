"use client";

import { useSyncExternalStore } from "react";
import { getSnapshot, subscribe, type ToastData } from "./toast-store";

/**
 * The current list of active toasts, reactively — `Toaster` is the only
 * place in this package that calls this (it's what actually renders the
 * list), but it's exported in case a consumer wants to build their own
 * toast list UI on top of the same store instead of `Toaster`'s.
 */
export function useToast(): ToastData[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
