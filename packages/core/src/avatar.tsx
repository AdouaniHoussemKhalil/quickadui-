"use client";

import { AvatarFallback as AvatarFallbackPrimitive, AvatarImage as AvatarImagePrimitive, AvatarRoot } from "@quickadui/primitives";
import { cn } from "@quickadui/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

export const avatarVariants = cva("relative flex shrink-0 overflow-hidden rounded-full", {
  variants: {
    size: {
      sm: "size-8",
      md: "size-10",
      lg: "size-14",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface AvatarProps extends ComponentProps<typeof AvatarRoot>, VariantProps<typeof avatarVariants> {}

export function Avatar({ className, size, ...props }: AvatarProps) {
  return <AvatarRoot className={cn(avatarVariants({ size }), className)} {...props} />;
}

export function AvatarImage({ className, ...props }: ComponentProps<typeof AvatarImagePrimitive>) {
  return <AvatarImagePrimitive className={cn("aspect-square size-full object-cover", className)} {...props} />;
}

export function AvatarFallback({ className, ...props }: ComponentProps<typeof AvatarFallbackPrimitive>) {
  return (
    <AvatarFallbackPrimitive
      className={cn("flex size-full items-center justify-center rounded-full bg-neutral-4 text-sm font-medium text-neutral-11", className)}
      {...props}
    />
  );
}
