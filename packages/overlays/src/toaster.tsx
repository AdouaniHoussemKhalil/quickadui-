"use client";

import { CloseIcon } from "@quickadui/icons";
import {
  ToastAction as ToastActionPrimitive,
  ToastClose as ToastClosePrimitive,
  ToastDescription as ToastDescriptionPrimitive,
  Toast as ToastPrimitive,
  ToastProvider as ToastProviderPrimitive,
  ToastTitle as ToastTitlePrimitive,
  ToastViewport as ToastViewportPrimitive,
} from "@quickadui/primitives";
import { cn } from "@quickadui/utils";
import { cva } from "class-variance-authority";
import { dismissToast, type ToastData } from "./toast-store";
import { useToast } from "./use-toast";

export const toastVariants = cva(
  "pointer-events-auto relative flex w-full items-start gap-3 rounded-md border p-4 shadow-lg",
  {
    variants: {
      variant: {
        default: "border-neutral-6 bg-neutral-1 text-neutral-12",
        success: "border-success-7 bg-success-3 text-success-11",
        warning: "border-warning-7 bg-warning-3 text-warning-11",
        danger: "border-danger-7 bg-danger-3 text-danger-11",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function ToastItem({
  id,
  title,
  description,
  variant,
  duration,
  actionLabel,
  onAction,
}: ToastData) {
  return (
    <ToastPrimitive
      className={cn(toastVariants({ variant }))}
      onOpenChange={(open) => {
        if (!open) dismissToast(id);
      }}
      // Passed conditionally, not `duration={duration}` — `duration` is
      // `number | undefined` (optional on `ToastData`), but explicitly
      // handing the primitive `duration={undefined}` isn't the same as
      // omitting the prop under `exactOptionalPropertyTypes`, and
      // omitting it is what lets `ToastProvider`'s own default apply.
      {...(duration !== undefined ? { duration } : {})}
    >
      <div className="flex-1">
        {title && (
          <ToastTitlePrimitive className="text-sm font-semibold">{title}</ToastTitlePrimitive>
        )}
        {description && (
          <ToastDescriptionPrimitive className="text-sm opacity-90">
            {description}
          </ToastDescriptionPrimitive>
        )}
      </div>
      {actionLabel && (
        <ToastActionPrimitive
          altText={actionLabel}
          onClick={onAction}
          className="shrink-0 rounded-sm border border-current px-2 py-1 text-xs font-medium outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-accent-8"
        >
          {actionLabel}
        </ToastActionPrimitive>
      )}
      <ToastClosePrimitive className="shrink-0 rounded-sm opacity-70 outline-none transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-accent-8">
        <CloseIcon size={14} />
        <span className="sr-only">Close</span>
      </ToastClosePrimitive>
    </ToastPrimitive>
  );
}

/**
 * Renders the currently active toasts (from `toast-store.ts`, via
 * `useToast`) plus the `ToastProvider`/`ToastViewport` Radix requires.
 * Mount this once, high in the tree (it's the `Toast` equivalent of
 * `TooltipProvider`) — then call `toast({ title, description, ... })`
 * from `toast-store.ts` anywhere else in the app to add one.
 */
export function Toaster() {
  const toasts = useToast();
  return (
    <ToastProviderPrimitive>
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} />
      ))}
      <ToastViewportPrimitive className="fixed bottom-0 right-0 z-[100] flex w-full max-w-sm flex-col gap-2 p-4 outline-none sm:bottom-4 sm:right-4" />
    </ToastProviderPrimitive>
  );
}
