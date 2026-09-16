"use client";

import { CheckIcon } from "@quickadui/icons";
import { cn } from "@quickadui/utils";
import { createContext, useContext, type ComponentProps, type ReactNode } from "react";

export type StepStatus = "complete" | "active" | "upcoming";

/**
 * Pure — given a step's own 0-based index and the stepper's current
 * value, which of the three visual states it's in. No React/context
 * involved, so it's unit-tested directly (see `stepper.test.ts`) rather
 * than through rendered output — the one piece of real logic the rest of
 * this file is built on.
 */
export function getStepStatus(step: number, currentValue: number): StepStatus {
  if (step < currentValue) {
    return "complete";
  }
  if (step === currentValue) {
    return "active";
  }
  return "upcoming";
}

interface StepperContextValue {
  orientation: "horizontal" | "vertical";
}

const StepperContext = createContext<StepperContextValue | null>(null);
const StepperItemStatusContext = createContext<StepStatus | null>(null);

export interface StepperProps extends ComponentProps<"ol"> {
  /** The current step's 0-based index — steps before it read as "complete", this one as "active", the rest as "upcoming" (via each `StepperItem`'s own `step` prop). */
  value: number;
  orientation?: "horizontal" | "vertical";
}

/**
 * `orientation` and `value` are provided via two separate contexts
 * (`StepperContext`/`StepperValueContext`) rather than one, only because
 * `StepperValueContext` needs a real default (`0`) to be usable outside
 * a `Stepper` in a type-safe way, while `orientation` doesn't have one
 * sensible default and should throw if misused — see
 * `useStepperOrientation` below. Every descendant that needs `value`
 * (`StepperItem`, `StepperSeparator`) reads `StepperValueContext`
 * directly and derives its own status from its own `step` prop via
 * `getStepStatus`.
 */
export function Stepper({ className, value, orientation = "horizontal", children, ...props }: StepperProps) {
  return (
    <StepperContext.Provider value={{ orientation }}>
      <StepperValueContext.Provider value={value}>
        <ol
          data-slot="stepper"
          data-orientation={orientation}
          className={cn("flex", orientation === "horizontal" ? "flex-row items-start" : "flex-col", className)}
          {...props}
        >
          {children}
        </ol>
      </StepperValueContext.Provider>
    </StepperContext.Provider>
  );
}

const StepperValueContext = createContext<number>(0);

function useStepperOrientation(componentName: string): "horizontal" | "vertical" {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error(`${componentName} must be used within a <Stepper>`);
  }
  return context.orientation;
}

export interface StepperItemProps extends ComponentProps<"li"> {
  /** This item's own 0-based index, compared against `Stepper`'s `value` to derive its status. */
  step: number;
}

export function StepperItem({ className, step, children, ...props }: StepperItemProps) {
  const orientation = useStepperOrientation("StepperItem");
  const value = useContext(StepperValueContext);
  const status = getStepStatus(step, value);

  return (
    <li
      data-slot="stepper-item"
      data-status={status}
      className={cn("group/step relative flex flex-1", orientation === "horizontal" ? "flex-col items-center gap-2" : "flex-row gap-3", className)}
      {...props}
    >
      <StepperItemStatusContext.Provider value={status}>{children}</StepperItemStatusContext.Provider>
    </li>
  );
}

export interface StepperIndicatorProps extends ComponentProps<"div"> {
  /** Rendered when the step isn't complete — typically the step number. Ignored once the step is complete, when a check mark takes over instead. */
  children?: ReactNode;
}

export function StepperIndicator({ className, children, ...props }: StepperIndicatorProps) {
  const status = useContext(StepperItemStatusContext);
  return (
    <div
      data-slot="stepper-indicator"
      className={cn(
        "z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-neutral-6 bg-neutral-1 text-sm font-medium text-neutral-11 transition-colors group-data-[status=active]/step:border-accent-9 group-data-[status=active]/step:text-accent-11 group-data-[status=complete]/step:border-accent-9 group-data-[status=complete]/step:bg-accent-9 group-data-[status=complete]/step:text-white",
        className,
      )}
      {...props}
    >
      {status === "complete" ? <CheckIcon size={16} /> : children}
    </div>
  );
}

export function StepperTitle({ className, ...props }: ComponentProps<"p">) {
  return <p data-slot="stepper-title" className={cn("text-sm font-medium text-neutral-12", className)} {...props} />;
}

export function StepperDescription({ className, ...props }: ComponentProps<"p">) {
  return <p data-slot="stepper-description" className={cn("text-xs text-neutral-11", className)} {...props} />;
}

export interface StepperSeparatorProps extends ComponentProps<"div"> {
  /** The 0-based index of the step immediately *before* this separator — it colors itself "complete" once that step is done (`Stepper`'s `value` has moved past it). */
  step: number;
}

/**
 * A sibling of `StepperItem` (rendered between items, not inside one) —
 * flexbox then distributes it evenly between the two indicators it
 * connects, the same way `@quickadui/primitives`' `Separator` is placed
 * between menu items rather than owned by one of them.
 *
 * Because it's a *sibling*, not a descendant, of the `StepperItem`
 * before it, it can't read that item's status via a
 * `group-data-[status]/step:` selector the way `StepperIndicator` does —
 * `group`/`group-data-*` only reaches into descendants. It reads
 * `Stepper`'s `value` from context directly instead and derives its own
 * completed/upcoming color from its own `step` prop, the same
 * `getStepStatus` comparison every other part in this file is built on.
 */
export function StepperSeparator({ className, step, ...props }: StepperSeparatorProps) {
  const value = useContext(StepperValueContext);
  const isComplete = value > step;
  return (
    <div
      data-slot="stepper-separator"
      data-status={isComplete ? "complete" : "upcoming"}
      className={cn("mx-2 mt-4 h-px flex-1 bg-neutral-6 sm:mx-4", isComplete && "bg-accent-9", className)}
      {...props}
    />
  );
}
