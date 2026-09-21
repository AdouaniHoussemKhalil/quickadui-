"use client";

import { Slot } from "@quickadui/primitives";
import { cn } from "@quickadui/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { Spinner } from "./spinner";

/**
 * Class names reference the semantic color scales from `@quickadui/tokens`
 * (via the `@theme` mapping in `@quickadui/theme`) — step 9 is always the
 * solid brand color, 3/4 the soft interactive background, 7 the outline
 * border, 11 the text color at that intensity. See the QuickadUI Blueprint,
 * §7, for the step numbering.
 *
 * `text-white` on the solid variants is a simplification: it reads fine
 * against this palette's specific accent/danger seeds (both mid-to-dark),
 * but a seed light enough to fail contrast against white wouldn't be
 * caught here — a real fix is a computed per-scale contrast token in
 * `@quickadui/tokens`, not yet built.
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-8 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        solid: "bg-accent-9 text-white hover:bg-accent-10",
        soft: "bg-accent-3 text-accent-11 hover:bg-accent-4",
        outline: "border border-accent-7 bg-transparent text-accent-11 hover:bg-accent-3",
        ghost: "bg-transparent text-accent-11 hover:bg-accent-3",
        destructive: "bg-danger-9 text-white hover:bg-danger-10",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "md",
    },
  },
);

/**
 * Where `icon` renders relative to the button's text content. There's no
 * icon-only mode here on purpose — that's `IconButton` (`icon-button.tsx`),
 * which has its own required `aria-label` and its own size/variant scale
 * suited to a square, text-free control. `Button` always keeps its
 * `children` as visible text; `icon` only ever supplements it.
 */
export type ButtonIconPosition = "left" | "right";

export interface ButtonProps extends ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  /** Merge these props onto the single child instead of rendering a `<button>` — see `@quickadui/primitives`' `Slot`. */
  asChild?: boolean;
  /**
   * Shows an inline `Spinner` (see `spinner.tsx`) before the button's own
   * content and disables the button while `true`. No effect when
   * `asChild` is set: `Slot` requires exactly one child to merge props
   * onto, so there's no single element to insert a spinner next to — an
   * `asChild` button driving its own loading state handles that on
   * whatever it's actually rendering instead.
   */
  isLoading?: boolean;
  /**
   * An icon element rendered alongside `children` (e.g. from
   * `@quickadui/icons`) — sized automatically via `buttonVariants`'s
   * `[&_svg]:size-4` selector, no manual sizing needed. While `isLoading`,
   * the loading `Spinner` takes over this same slot instead (see
   * `resolveButtonIcon`), so a button never shows both a spinner and an
   * icon at once. No effect when `asChild` is set, for the same reason
   * `isLoading` isn't wired there — see that prop's doc comment.
   */
  icon?: ReactNode;
  /**
   * Which side `icon` (or the loading `Spinner`) renders on. Defaults to
   * `"left"`. Ignored when `icon` is unset and `isLoading` is falsy —
   * there's nothing to position.
   */
  iconPosition?: ButtonIconPosition;
}

/**
 * Whether the button should render `disabled` — pulled out as a plain,
 * DOM-free function so it has a real unit test: this package's tests are
 * all at the CVA-variant/plain-logic level (no `@testing-library/react`
 * dependency to render JSX against), same reasoning as `spinnerVariants`
 * being tested directly rather than through a rendered `<Spinner>`.
 * `isLoading` always forces `disabled`, regardless of what `disabled`
 * itself was passed as — you can't usefully click a button whose action
 * is already in flight.
 */
export function resolveButtonDisabled(isLoading: boolean | undefined, disabled: boolean | undefined): boolean {
  return Boolean(isLoading) || Boolean(disabled);
}

/**
 * Whichever of `icon` or the loading `Spinner` actually occupies the
 * button's icon slot. The `Spinner` takes over while `isLoading` — same
 * "loading wins" rule `resolveButtonDisabled` enforces for `disabled` —
 * so a button never renders both a spinner and an icon at once. Pulled
 * out as its own function for the same "real, isolated test" reasoning
 * as `resolveButtonDisabled`, even though (unlike that one) this one
 * still returns JSX rather than a primitive.
 */
export function resolveButtonIcon(icon: ReactNode | undefined, isLoading: boolean | undefined): ReactNode {
  if (isLoading) {
    return <Spinner size="sm" className="text-current" />;
  }
  return icon;
}

export function Button({
  className,
  variant,
  size,
  asChild,
  isLoading,
  icon,
  iconPosition = "left",
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  if (asChild) {
    // See the `isLoading`/`icon` doc comments above — deliberately not
    // wired here, `Slot` needs exactly one child to merge props onto.
    return (
      <Comp
        data-slot="button"
        disabled={disabled}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </Comp>
    );
  }

  const iconSlot = resolveButtonIcon(icon, isLoading);

  return (
    <Comp
      data-slot="button"
      disabled={resolveButtonDisabled(isLoading, disabled)}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {iconPosition === "left" && iconSlot}
      {children}
      {iconPosition === "right" && iconSlot}
    </Comp>
  );
}
