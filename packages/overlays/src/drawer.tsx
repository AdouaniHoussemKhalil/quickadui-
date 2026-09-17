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
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

/**
 * A dialog anchored to a screen edge — the exact same
 * `@quickadui/primitives` `Dialog` that `Modal` (in this same package)
 * uses, styled to slide in from `side` instead of appearing centered.
 * Same "no enter/exit animation yet" caveat as `Modal` — see that file.
 */
export function Drawer(props: ComponentProps<typeof DialogPrimitive>) {
  return <DialogPrimitive {...props} />;
}

export function DrawerTrigger(props: ComponentProps<typeof DialogTriggerPrimitive>) {
  return <DialogTriggerPrimitive {...props} />;
}

export function DrawerClose(props: ComponentProps<typeof DialogClosePrimitive>) {
  return <DialogClosePrimitive {...props} />;
}

export function DrawerOverlay({
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

export const drawerContentVariants = cva(
  "fixed z-50 flex flex-col gap-4 border-neutral-6 bg-neutral-1 p-6 text-neutral-12 shadow-lg outline-none",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b",
        bottom: "inset-x-0 bottom-0 border-t",
        left: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
);

export interface DrawerContentProps
  extends ComponentProps<typeof DialogContentPrimitive>,
    VariantProps<typeof drawerContentVariants> {}

export function DrawerContent({ className, side, children, ...props }: DrawerContentProps) {
  return (
    <DialogPortalPrimitive>
      <DrawerOverlay />
      <DialogContentPrimitive className={cn(drawerContentVariants({ side }), className)} {...props}>
        {children}
        <DialogClosePrimitive className="absolute right-4 top-4 rounded-sm text-neutral-11 outline-none transition-colors hover:text-neutral-12 focus-visible:ring-2 focus-visible:ring-accent-8 focus-visible:ring-offset-2">
          <CloseIcon size={16} />
          <span className="sr-only">Close</span>
        </DialogClosePrimitive>
      </DialogContentPrimitive>
    </DialogPortalPrimitive>
  );
}

export function DrawerHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("flex flex-col gap-1.5 text-center sm:text-left", className)}
      {...props}
    />
  );
}

export function DrawerFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

export function DrawerTitle({ className, ...props }: ComponentProps<typeof DialogTitlePrimitive>) {
  return (
    <DialogTitlePrimitive
      className={cn("text-lg font-semibold text-neutral-12", className)}
      {...props}
    />
  );
}

export function DrawerDescription({
  className,
  ...props
}: ComponentProps<typeof DialogDescriptionPrimitive>) {
  return (
    <DialogDescriptionPrimitive className={cn("text-sm text-neutral-11", className)} {...props} />
  );
}
