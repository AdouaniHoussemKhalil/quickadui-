import { resolve } from "node:path";
import { toKebabCase, toNaivePlural, toPascalCase } from "../generate/case.js";
import { checkRequiredPackages } from "../generate/check-prerequisites.js";
import { parseFieldSpec } from "../generate/field-spec.js";
import { renderGenerateResourceNextSteps } from "../generate/render-generate-next-steps.js";
import {
  renderResourceFiles,
  type ResourceButtonIcons,
  type ResourceEndpoints,
  type ResourceToasts,
} from "../generate/resource-templates.js";
import { writeScaffoldFiles } from "../generate/write-files.js";

const DEFAULT_API_BASE = "https://dummyjson.com";

// `quickadui generate resource` writes code that imports these three
// packages directly (Button from core, Table/Pagination from data,
// Form/Input/useForm/zodResolver from forms) — see
// `check-prerequisites.ts` for why this is checked up front.
const REQUIRED_PACKAGES = ["@quickadui/core", "@quickadui/data", "@quickadui/forms"] as const;

export interface GenerateResourceOptions {
  readonly projectDir: string;
  readonly typeName: string;
  /** Raw `--fields` value, e.g. "title:string,price:number" — parsed here, not by the caller. */
  readonly fieldsSpec: string;
  /** URL path segment, e.g. "products". Defaults to a naive plural of `typeName`. */
  readonly endpoint?: string | undefined;
  /** Defaults to the free DummyJSON demo API. */
  readonly apiBase?: string | undefined;
  /** Omit entirely for today's default: DummyJSON-style conventions for every action. Currently only reachable via `quickadui apply <config.json>` — no CLI flag for it yet, same reasoning as `buttonIcons` below. */
  readonly endpoints?: ResourceEndpoints | undefined;
  /** Omit entirely for today's default: every standard button stays text-only. Currently only reachable via `quickadui apply <config.json>` — no CLI flag for it yet, since it's a small object, not a single string worth a flag mini-format. */
  readonly buttonIcons?: ResourceButtonIcons | undefined;
  /** Omit entirely for today's default: no toasts. Currently only reachable via `quickadui apply <config.json>`, same reasoning as `buttonIcons`. */
  readonly toasts?: ResourceToasts | undefined;
  /** Omit (or `false`) for today's default: Delete fires immediately, no confirmation. Currently only reachable via `quickadui apply <config.json>`. */
  readonly confirmDelete?: boolean | string | undefined;
}

export interface GenerateResourceResult {
  readonly filesWritten: readonly string[];
  readonly nextSteps: string;
}

/**
 * Generates a typed API client, a Zod schema, a list page, and a
 * create/edit form page for one resource, into the project at
 * `options.projectDir` — front-end only; see `packages/cli/README.md`
 * for why (and how `--api-base` fits in). Refuses to run if the required
 * QuickadUI packages haven't been added to the project yet.
 */
export function runGenerateResource(options: GenerateResourceOptions): GenerateResourceResult {
  if (options.typeName.trim() === "") {
    throw new Error(
      "`quickadui generate resource` needs a type name, e.g. `quickadui generate resource Product`.",
    );
  }

  const projectDir = resolve(options.projectDir);
  checkRequiredPackages(projectDir, REQUIRED_PACKAGES);

  const fields = parseFieldSpec(options.fieldsSpec);
  const typeName = toPascalCase(options.typeName);
  const endpoint = options.endpoint ?? toKebabCase(toNaivePlural(typeName));
  const apiBase = options.apiBase ?? DEFAULT_API_BASE;

  const files = renderResourceFiles({
    typeName,
    fields,
    endpoint,
    apiBase,
    ...(options.endpoints !== undefined ? { endpoints: options.endpoints } : {}),
    ...(options.buttonIcons !== undefined ? { buttonIcons: options.buttonIcons } : {}),
    ...(options.toasts !== undefined ? { toasts: options.toasts } : {}),
    ...(options.confirmDelete !== undefined ? { confirmDelete: options.confirmDelete } : {}),
  });
  const filesWritten = writeScaffoldFiles(projectDir, files);

  return {
    filesWritten,
    nextSteps: renderGenerateResourceNextSteps({ typeName, endpoint, apiBase, filesWritten }),
  };
}
