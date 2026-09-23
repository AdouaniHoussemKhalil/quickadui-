"use client";

import { EyeIcon, EyeOffIcon } from "@quickadui/icons";
import { cn } from "@quickadui/utils";
import { type ChangeEvent, useState } from "react";
import { Input, type InputProps } from "./input";
import type { PasswordRule } from "./password-strength";
import { PasswordStrengthMeter } from "./password-strength-meter";

export interface PasswordInputProps extends Omit<InputProps, "type"> {
  /** Renders a PasswordStrengthMeter below the field, reading this same input's live value. Default: false. */
  showStrength?: boolean;
  /** Forwarded to PasswordStrengthMeter's rules prop when showStrength is true. */
  strengthRules?: PasswordRule[] | undefined;
}

/**
 * An Input pre-wired for passwords: masked by default, with a trailing
 * eye/eye-off toggle to reveal the value, and an optional live strength
 * meter (see `password-strength-meter.tsx`) below it. Uncontrolled by
 * default like a plain `<input>` (same `isControlled` pattern
 * `@quickadui/data`'s `TreeView` uses) — pass `value`/`onChange` to
 * control it instead; either way `showStrength` reads from the field's
 * real current value, so the meter updates on every keystroke.
 */
export function PasswordInput({
  showStrength = false,
  strengthRules,
  className,
  defaultValue,
  value,
  onChange,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] = useState(String(defaultValue ?? ""));
  const isControlled = value !== undefined;
  const currentValue = isControlled ? String(value) : uncontrolledValue;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (!isControlled) {
      setUncontrolledValue(event.target.value);
    }
    onChange?.(event);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Input
          type={visible ? "text" : "password"}
          className={cn("pr-10", className)}
          defaultValue={defaultValue}
          value={value}
          onChange={handleChange}
          {...props}
        />
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((prev) => !prev)}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-neutral-9 hover:text-neutral-11"
        >
          {visible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
        </button>
      </div>
      {showStrength && <PasswordStrengthMeter value={currentValue} rules={strengthRules} />}
    </div>
  );
}
