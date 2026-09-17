"use client";

import { CloseIcon } from "@quickadui/icons";
import {
  DialogClose as DialogClosePrimitive,
  DialogContent as DialogContentPrimitive,
  DialogDescription as DialogDescriptionPrimitive,
  DialogOverlay as DialogOverlayPrimitive,
  DialogPortal as DialogPortalPrimitive,
  Dialog as DialogPrimitive,
  DialogTitle as DialogTitlePrimitive,
  DialogTrigger as DialogTriggerPrimitive,
} from "@quickadui/primitives";
import { cn } from "@quickadui/utils";
import type { ComponentProps } from "react";

/**
 * A centered, backdrop-covered dialog — built on
 * `@quickadui/primitives`' `Dialog` (the same underlying Radix Dialog
 * `Drawer`, in this same package, uses too — a modal and a drawer are the
 * same behavior, styled differently, not two different primitives).
 *
 * No enter/exit animation on the overlay or content yet — that needs
 * either Tailwind keyframes defined in `@quickadui/theme`'s generated CSS
 * or `@quickadui/animation` (still a scaffold), and inventing classes
 * that assume one of those exists is exactly the silent-no-styling
 * mistake documented in `apps/playground/README.md`'s `@source` section
 * — an unmatched class just renders as nothing, no error anywhere.
 */
export function Modal(props: ComponentProps<typeof DialogPrimitive>) {
  return <DialogPrimitive {...props} />;
}

export function ModalTrigger(props: ComponentProps<typeof DialogTriggerPrimitive>) {
  return <DialogTriggerPrimitive {...props} />;
}

export function ModalClose(props: ComponentProps<typeof DialogClosePrimitive>) {
  return <DialogClosePrimitive {...props} />;
}

export function ModalOverlay({
  className,
  ...props
}: ComponentProps<typeof DialogOverlayPrimitive>) {
  return (
    <DialogOverlayPrimitive
      className={cn("fixed inset-0 z-50 bg-black/50", className)}
      {...props}
    />
  );
}

export function ModalContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogContentPrimitive>) {
  return (
    <DialogPortalPrimitive>
      <ModalOverlay />
      <DialogContentPrimitive
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-neutral-6 bg-neutral-1 p-6 text-neutral-12 shadow-lg outline-none",
          className,
        )}
        {...props}
      >
        {children}
        <DialogClosePrimitive className="absolute right-4 top-4 rounded-sm text-neutral-11 outline-none transition-colors hover:text-neutral-12 focus-visible:ring-2 focus-visible:ring-accent-8 focus-visible:ring-offset-2">
          <CloseIcon size={16} />
          <span className="sr-only">Close</span>
        </DialogClosePrimitive>
      </DialogContentPrimitive>
    </DialogPortalPrimitive>
  );
}

export function ModalHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="modal-header"
      className={cn("flex flex-col gap-1.5 text-center sm:text-left", className)}
      {...props}
    />
  );
}

export function ModalFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="modal-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

export function ModalTitle({ className, ...props }: ComponentProps<typeof DialogTitlePrimitive>) {
  return (
    <DialogTitlePrimitive
      className={cn("text-lg font-semibold text-neutral-12", className)}
      {...props}
    />
  );
}

export function ModalDescription({
  className,
  ...props
}: ComponentProps<typeof DialogDescriptionPrimitive>) {
  return (
    <DialogDescriptionPrimitive className={cn("text-sm text-neutral-11", className)} {...props} />
  );
}
