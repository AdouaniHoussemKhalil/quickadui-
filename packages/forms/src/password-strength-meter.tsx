"use client";

import { CheckIcon, CloseIcon } from "@quickadui/icons";
import { cn } from "@quickadui/utils";
import type { ComponentProps } from "react";
import {
  defaultPasswordRules,
  getPasswordStrength,
  type PasswordRule,
  type PasswordStrengthLabel,
} from "./password-strength";

export interface PasswordStrengthMeterProps extends Omit<ComponentProps<"div">, "children"> {
  /** The password value to evaluate — usually the same value passed to the paired PasswordInput. */
  value: string;
  /** Rule set to evaluate against. Default: defaultPasswordRules (length + one rule per character class). */
  rules?: PasswordRule[] | undefined;
  /** Hide the per-rule checklist and show only the segmented strength bar. Default: false. */
  hideRules?: boolean;
}

const LABEL_COLOR: Record<PasswordStrengthLabel, string> = {
  "Too weak": "text-danger-11",
  Weak: "text-danger-11",
  Fair: "text-warning-11",
  Good: "text-success-11",
  Strong: "text-success-11",
};

const SEGMENT_COLOR: Record<PasswordStrengthLabel, string> = {
  "Too weak": "bg-danger-9",
  Weak: "bg-danger-9",
  Fair: "bg-warning-9",
  Good: "bg-success-9",
  Strong: "bg-success-9",
};

/**
 * A live password-strength readout: a segmented bar (one segment per rule,
 * colored by how many passed) plus an optional per-rule checklist below it
 * — each rule shown with a check or an x as the password changes. Pure
 * presentation over `getPasswordStrength` (see `password-strength.ts`);
 * pair with `PasswordInput`'s `showStrength` prop for the common case, or
 * render this standalone (e.g. next to a separate "confirm password"
 * field) when you need more control over layout.
 */
export function PasswordStrengthMeter({
  value,
  rules = defaultPasswordRules,
  hideRules = false,
  className,
  ...props
}: PasswordStrengthMeterProps) {
  const strength = getPasswordStrength(value, rules);
  const segmentColor = SEGMENT_COLOR[strength.label];

  return (
    <div
      data-slot="password-strength-meter"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    >
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1" role="presentation">
          {strength.rules.map((rule, index) => (
            <div
              key={rule.id}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                index < strength.score ? segmentColor : "bg-neutral-5",
              )}
            />
          ))}
        </div>
        <span className={cn("text-xs font-medium", LABEL_COLOR[strength.label])}>
          {strength.label}
        </span>
      </div>
      {!hideRules && (
        <ul data-slot="password-strength-rules" className="flex flex-col gap-1">
          {strength.rules.map((rule) => (
            <li key={rule.id} className="flex items-center gap-1.5 text-xs">
              {rule.passed ? (
                <CheckIcon size={14} className="text-success-9" />
              ) : (
                <CloseIcon size={14} className="text-neutral-8" />
              )}
              <span className={rule.passed ? "text-neutral-11" : "text-neutral-9"}>{rule.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
