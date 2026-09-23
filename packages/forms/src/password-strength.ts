export interface PasswordRule {
  /** Stable id, also used as the React key when rendering this rule's row. */
  id: string;
  /** Shown next to the rule's pass/fail indicator. */
  label: string;
  test: (password: string) => boolean;
}

/**
 * The default rule set: minimum length plus one rule per character class.
 * Deliberately simple and inspectable (as opposed to an entropy estimate
 * like zxcvbn) — every rule maps to something the user can see and act on
 * while typing, and there's no extra dependency to install. Pass your own
 * `rules` to `getPasswordStrength`/`PasswordStrengthMeter` to change the
 * policy (a different minimum length, requiring a symbol, ...).
 */
export const defaultPasswordRules: PasswordRule[] = [
  { id: "length", label: "At least 8 characters", test: (value) => value.length >= 8 },
  { id: "lowercase", label: "A lowercase letter", test: (value) => /[a-z]/.test(value) },
  { id: "uppercase", label: "An uppercase letter", test: (value) => /[A-Z]/.test(value) },
  { id: "number", label: "A number", test: (value) => /[0-9]/.test(value) },
  { id: "symbol", label: "A symbol", test: (value) => /[^A-Za-z0-9]/.test(value) },
];

export type PasswordStrengthLabel = "Too weak" | "Weak" | "Fair" | "Good" | "Strong";

export interface PasswordRuleResult extends PasswordRule {
  passed: boolean;
}

export interface PasswordStrength {
  /** How many rules passed. */
  score: number;
  /** Total number of rules evaluated. */
  total: number;
  /** Each rule, with whether it passed. Same order as the input rules. */
  rules: PasswordRuleResult[];
  /** A human label for `score`/`total`, for a compact summary next to the meter. */
  label: PasswordStrengthLabel;
}

/**
 * Evaluates `password` against `rules` (default: `defaultPasswordRules`)
 * and returns a score, the per-rule pass/fail breakdown, and a label. Pure
 * — no DOM, no dependency on `PasswordInput`/`PasswordStrengthMeter` — so
 * it's usable on its own (server-side validation, a signup form that
 * doesn't use `PasswordInput`, ...) and is unit-tested directly.
 */
export function getPasswordStrength(
  password: string,
  rules: PasswordRule[] = defaultPasswordRules,
): PasswordStrength {
  const results = rules.map((rule) => ({ ...rule, passed: rule.test(password) }));
  const score = results.filter((rule) => rule.passed).length;
  return {
    score,
    total: rules.length,
    rules: results,
    label: scoreToLabel(score, rules.length),
  };
}

function scoreToLabel(score: number, total: number): PasswordStrengthLabel {
  if (total === 0 || score === 0) {
    return "Too weak";
  }
  const ratio = score / total;
  if (ratio < 0.4) {
    return "Weak";
  }
  if (ratio < 0.7) {
    return "Fair";
  }
  if (ratio < 1) {
    return "Good";
  }
  return "Strong";
}
