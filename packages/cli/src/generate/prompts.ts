// The CLI's one interactive piece — `generate app` asks "Add a Navbar?"/
// "Add a Sidebar?"/"Add a Footer?" and, for each yes, what items to use.
// Every other command is fully argv-driven on purpose (see the README's
// "What's deliberately out of scope"), so this is a deliberate, narrow
// exception: composing an app shell has enough small yes/no decisions that
// forcing them all onto flags makes the common case ("just ask me") more
// typing than answering three questions. `--yes` (or passing every
// relevant flag explicitly) skips this file entirely — see
// `commands/generate-app.ts`.
//
// Built on Node's built-in `readline/promises`, not a library — same
// zero-runtime-dependency reasoning as `args.ts`/`generate/case.ts`. This
// file is the CLI's only stdin/stdout boundary, so — like
// `commands/*.ts` touching the filesystem — it's deliberately thin and
// untested directly; the parsing it hands off to (`parseNavItemsSpec`) is
// pure and tested on its own in `nav-items.test.ts`.

import { createInterface } from "node:readline/promises";

export interface Prompter {
  /** Asks a yes/no question. Empty input (just pressing Enter) accepts `defaultValue`. */
  confirm(question: string, defaultValue: boolean): Promise<boolean>;
  /** Asks a free-text question, pre-filled with `defaultValue`. Empty input accepts it as-is. */
  text(question: string, defaultValue: string): Promise<string>;
  /** Releases the underlying readline interface — call once, when done asking. */
  close(): void;
}

function formatConfirmSuffix(defaultValue: boolean): string {
  return defaultValue ? "[Y/n]" : "[y/N]";
}

function parseYesNo(answer: string, defaultValue: boolean): boolean {
  const normalized = answer.trim().toLowerCase();
  if (normalized === "") {
    return defaultValue;
  }
  return normalized === "y" || normalized === "yes";
}

/** Creates a `Prompter` over the real process stdin/stdout. */
export function createPrompter(): Prompter {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  return {
    async confirm(question, defaultValue) {
      const answer = await rl.question(`${question} ${formatConfirmSuffix(defaultValue)} `);
      return parseYesNo(answer, defaultValue);
    },
    async text(question, defaultValue) {
      const prompt = defaultValue.length > 0 ? `${question} [${defaultValue}] ` : `${question} `;
      const answer = (await rl.question(prompt)).trim();
      return answer.length > 0 ? answer : defaultValue;
    },
    close() {
      rl.close();
    },
  };
}
