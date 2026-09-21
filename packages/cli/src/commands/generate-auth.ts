import { resolve } from "node:path";
import { renderAuthFiles } from "../generate/auth-templates.js";
import { checkRequiredPackages } from "../generate/check-prerequisites.js";
import { renderGenerateAuthNextSteps } from "../generate/render-generate-next-steps.js";
import { writeScaffoldFiles } from "../generate/write-files.js";

const DEFAULT_API_BASE = "https://dummyjson.com";

// Button/Card/Avatar from core, Form/Input/useForm/zodResolver from
// forms — see `check-prerequisites.ts`.
const REQUIRED_PACKAGES = ["@quickadui/core", "@quickadui/forms"] as const;

export interface GenerateAuthOptions {
  readonly projectDir: string;
  /** Defaults to the free DummyJSON demo API. */
  readonly apiBase?: string | undefined;
}

export interface GenerateAuthResult {
  readonly filesWritten: readonly string[];
  readonly nextSteps: string;
}

/**
 * Generates an auth client, an `AuthProvider`/`useAuth()`, a login page,
 * and a profile page, into the project at `options.projectDir`. See
 * `auth-templates.ts`'s own header comment for why there's no generated
 * sign-up page.
 */
export function runGenerateAuth(options: GenerateAuthOptions): GenerateAuthResult {
  const projectDir = resolve(options.projectDir);
  checkRequiredPackages(projectDir, REQUIRED_PACKAGES);

  const apiBase = options.apiBase ?? DEFAULT_API_BASE;

  const files = renderAuthFiles({ apiBase });
  const filesWritten = writeScaffoldFiles(projectDir, files);

  return {
    filesWritten,
    nextSteps: renderGenerateAuthNextSteps({ apiBase, filesWritten }),
  };
}
