import { cn } from "@quickadui/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

export const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:size-4 [&:has(svg)]:pl-11",
  {
    variants: {
      variant: {
        default: "border-neutral-6 bg-neutral-1 text-neutral-12 [&>svg]:text-neutral-11",
        success: "border-success-7 bg-success-2 text-success-11 [&>svg]:text-success-11",
        warning: "border-warning-7 bg-warning-2 text-warning-11 [&>svg]:text-warning-11",
        danger: "border-danger-7 bg-danger-2 text-danger-11 [&>svg]:text-danger-11",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface AlertProps extends ComponentProps<"div">, VariantProps<typeof alertVariants> {}

export function Alert({ className, variant, ...props }: AlertProps) {
  return <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}

export function AlertTitle({ className, ...props }: ComponentProps<"h5">) {
  return <h5 data-slot="alert-title" className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props} />;
}

export function AlertDescription({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="alert-description" className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />;
}
