"use client";

import { EyeIcon, EyeOffIcon } from "@quickadui/icons";
import { type ChangeEvent, useState } from "react";
import { Input, type InputProps } from "./input";
import type { PasswordRule } from "./password-strength";
import { PasswordStrengthMeter } from "./password-strength-meter";

export interface PasswordInputProps extends Omit<InputProps, "type" | "endIcon"> {
  /**
   * Renders a PasswordStrengthMeter below the field, reading this same
   * input's live value. Default: false.
   */
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
 *
 * The toggle is just `Input`'s own `endIcon` slot with a real button
 * inside — sized automatically to match whatever `inputSize` you pass,
 * the same as any other `endIcon`.
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
      <Input
        type={visible ? "text" : "password"}
        className={className}
        defaultValue={defaultValue}
        value={value}
        onChange={handleChange}
        endIcon={
          <button
            type="button"
            aria-label={visible ? "Hide password" : "Show password"}
            onClick={() => setVisible((prev) => !prev)}
            className="flex h-full w-full items-center justify-center text-neutral-9 hover:text-neutral-11"
          >
            {visible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
          </button>
        }
        {...props}
      />
      {showStrength && <PasswordStrengthMeter value={currentValue} rules={strengthRules} />}
    </div>
  );
}
