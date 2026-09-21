// Pure template-string builders for `quickadui generate resource` — same
// "pure builder here, filesystem writes only in commands/" split as
// `templates.ts` uses for `init`. Every generated file is real, editable
// source dropped into the *consumer's* project: nothing here runs inside
// this monorepo.

import type { ScaffoldFile } from "../templates.js";
import { toCamelCase, toKebabCase, toLabel, toNaivePlural, toPascalCase } from "./case.js";
import type { FieldSpec, FieldType } from "./field-spec.js";

/**
 * One button's icon config — see `quickadui-config.ts`'s
 * `QuickaduiConfigResourceButtonIconSlot` (same shape, this is the
 * codegen-facing mirror of it). A plain string keeps the button's text
 * visible alongside the icon; `{ icon, showLabel: false }` drops the
 * text and renders icon-only via `IconButton` instead of `Button`.
 */
export type ResourceButtonIconSlot = string | { readonly icon: string; readonly showLabel?: boolean };

/**
 * Icons for the five standard buttons this generator always produces —
 * see `quickadui-config.ts`'s `QuickaduiConfigResourceButtonIcons` (same
 * shape, this is the codegen-facing mirror of it). A button whose icon
 * is left unset stays text-only, exactly like before this feature
 * existed.
 */
export interface ResourceButtonIcons {
  readonly create?: ResourceButtonIconSlot;
  readonly edit?: ResourceButtonIconSlot;
  readonly delete?: ResourceButtonIconSlot;
  readonly save?: ResourceButtonIconSlot;
  readonly cancel?: ResourceButtonIconSlot;
}

interface NormalizedIconSlot {
  readonly icon: string;
  readonly showLabel: boolean;
}

/** A plain string defaults to `showLabel: true` — the same "icon + visible text" behavior this feature always had, before `showLabel` existed. */
function normalizeIconSlot(slot: ResourceButtonIconSlot | undefined): NormalizedIconSlot | undefined {
  if (slot === undefined) {
    return undefined;
  }
  if (typeof slot === "string") {
    return { icon: slot, showLabel: true };
  }
  return { icon: slot.icon, showLabel: slot.showLabel ?? true };
}

/** See `quickadui-config.ts`'s `QuickaduiConfigResourceToasts` (same shape, codegen-facing mirror). */
export interface ResourceToasts {
  readonly createSuccess?: string;
  readonly createError?: string;
  readonly updateSuccess?: string;
  readonly updateError?: string;
  readonly deleteSuccess?: string;
  readonly deleteError?: string;
}

export interface ResourceTemplateOptions {
  /** As typed on the command line, e.g. "Product" — normalized to PascalCase everywhere below. */
  readonly typeName: string;
  readonly fields: readonly FieldSpec[];
  /** URL path segment, e.g. "products" for https://dummyjson.com/products. */
  readonly endpoint: string;
  /** e.g. "https://dummyjson.com" — no trailing slash. */
  readonly apiBase: string;
  /** Omit entirely for today's default: every standard button stays text-only. */
  readonly buttonIcons?: ResourceButtonIcons;
  /** Omit entirely for today's default: no toasts, errors only shown inline/via `submitError`. */
  readonly toasts?: ResourceToasts;
  /** Omit (or `false`) for today's default: Delete fires immediately, no confirmation. `true` for a generic message, a string for a custom one. */
  readonly confirmDelete?: boolean | string;
}

/**
 * One `import { XIcon, YIcon } from "@quickadui/icons";` line for the
 * given, already-deduplicated icon names — or `""` when there's nothing
 * to import, so callers can splice this straight into a template without
 * an extra conditional at each call site. Mirrors
 * `app-shell-templates.ts`'s own `usedIconNames`/import-line pattern.
 */
function iconImportLine(names: readonly (string | undefined)[]): string {
  const unique = [...new Set(names.filter((name): name is string => name !== undefined))].sort();
  if (unique.length === 0) {
    return "";
  }
  return `import { ${unique.map((name) => `${name}Icon`).join(", ")} } from "@quickadui/icons";\n`;
}

/** `<XIcon size={16} aria-hidden />` for a given icon name, or `""` when unset — for splicing directly before a button's text label. */
function iconJsx(name: string | undefined): string {
  return name !== undefined ? `<${name}Icon size={16} aria-hidden />` : "";
}

/**
 * `import { Button, IconButton, Spinner } from "@quickadui/core";`,
 * including only the names a page's buttons actually need — `Spinner`
 * is always included (every generated page already uses it for its own
 * loading state), `Button`/`IconButton` only when at least one button on
 * the page renders that way. With no `buttonIcons` set at all, every
 * button stays text-only and this collapses to today's
 * `import { Button, Spinner } from "@quickadui/core";` exactly.
 */
function coreImportLine(needsButton: boolean, needsIconButton: boolean): string {
  const names = [...(needsButton ? ["Button"] : []), ...(needsIconButton ? ["IconButton"] : []), "Spinner"];
  return `import { ${names.join(", ")} } from "@quickadui/core";`;
}

/**
 * `import { ..., toast } from "@quickadui/overlays";`, including only
 * the names this page's toasts/confirm-delete dialog actually need —
 * `""` (no import at all) when neither is in use, so callers can splice
 * this in unconditionally without an extra `if` at the call site.
 */
function overlaysImportLine(needsToast: boolean, needsModal: boolean): string {
  if (!needsToast && !needsModal) {
    return "";
  }
  const names = [
    ...(needsModal
      ? ["Modal", "ModalClose", "ModalContent", "ModalDescription", "ModalFooter", "ModalHeader", "ModalTitle"]
      : []),
    ...(needsToast ? ["toast"] : []),
  ];
  return `import { ${names.join(", ")} } from "@quickadui/overlays";\n`;
}

const TOAST_DEFAULTS = {
  createSuccess: (label: string) => `${capitalize(label)} created.`,
  createError: (label: string) => `Failed to create ${label}.`,
  updateSuccess: (label: string) => `${capitalize(label)} updated.`,
  updateError: (label: string) => `Failed to update ${label}.`,
  deleteSuccess: (label: string) => `${capitalize(label)} deleted.`,
  deleteError: (label: string) => `Failed to delete ${label}.`,
} as const;

function capitalize(s: string): string {
  return s.length === 0 ? s : s[0]?.toUpperCase() + s.slice(1);
}

/** Every toast message this resource will actually use, filling in `TOAST_DEFAULTS` for any key the config didn't set — so opting into `toasts` at all (even with just one key) still gets a sensible message on every action, not just the ones explicitly authored. */
function resolveToastMessages(toasts: ResourceToasts, label: string): Required<ResourceToasts> {
  return {
    createSuccess: toasts.createSuccess ?? TOAST_DEFAULTS.createSuccess(label),
    createError: toasts.createError ?? TOAST_DEFAULTS.createError(label),
    updateSuccess: toasts.updateSuccess ?? TOAST_DEFAULTS.updateSuccess(label),
    updateError: toasts.updateError ?? TOAST_DEFAULTS.updateError(label),
    deleteSuccess: toasts.deleteSuccess ?? TOAST_DEFAULTS.deleteSuccess(label),
    deleteError: toasts.deleteError ?? TOAST_DEFAULTS.deleteError(label),
  };
}

/** `"..."` — a JS string literal, single-quote-safe (messages come from a JSON config, which can't contain an unescaped double quote already, but this still runs the value through `JSON.stringify` rather than hand-wrapping it in quotes, so an embedded `"` or backslash comes out correctly escaped either way). */
function jsString(value: string): string {
  return JSON.stringify(value);
}

/**
 * The list page's "New X" button, top-right — `asChild` wrapping an
 * `<a>`, so an icon-only render uses `IconButton`'s own `asChild`
 * support the same way.
 */
function renderCreateButton(endpoint: string, label: string, slot: NormalizedIconSlot | undefined): string {
  const icon = slot !== undefined ? iconJsx(slot.icon) : "";
  if (slot !== undefined && !slot.showLabel) {
    return `        <IconButton asChild variant="solid" aria-label="New ${label}">
          <a href="#/${endpoint}/new">${icon}</a>
        </IconButton>`;
  }
  return `        <Button asChild>
          <a href="#/${endpoint}/new">${icon}New ${label}</a>
        </Button>`;
}

/** Each row's Edit button — `asChild` wrapping an `<a>`, same pattern as Create. */
function renderEditButton(endpoint: string, slot: NormalizedIconSlot | undefined): string {
  const icon = slot !== undefined ? iconJsx(slot.icon) : "";
  if (slot !== undefined && !slot.showLabel) {
    return `                    <IconButton asChild variant="outline" size="sm" aria-label="Edit">
                      <a href={\`#/${endpoint}/\${item.id}/edit\`}>${icon}</a>
                    </IconButton>`;
  }
  return `                    <Button variant="outline" size="sm" asChild>
                      <a href={\`#/${endpoint}/\${item.id}/edit\`}>${icon}Edit</a>
                    </Button>`;
}

/**
 * Each row's Delete button — a real `<button onClick>`, not `asChild`,
 * so the icon-only render swaps in `IconButton` with a manual
 * `isLoading`-style Spinner swap (`IconButton` has no built-in
 * `isLoading`, unlike `Button`) and an explicit `disabled`. Also the one
 * spot with a real, documented gap: `IconButton` has no `"destructive"`
 * variant, so this falls back to `variant="ghost"` plus a danger-colored
 * `className` to keep the same visual intent.
 *
 * `confirmDelete` swaps the click target from firing the delete
 * immediately (`handleDelete(item.id)`) to opening the confirm Modal
 * instead (`setPendingDeleteId(item.id)`) — the Modal's own Delete
 * button (built by `renderConfirmDeleteModal`) is what actually calls
 * `handleDelete` once the person confirms.
 */
function renderDeleteButton(slot: NormalizedIconSlot | undefined, confirmDelete: boolean): string {
  const icon = slot !== undefined ? iconJsx(slot.icon) : "";
  const onClick = confirmDelete ? "() => setPendingDeleteId(item.id)" : "() => handleDelete(item.id)";
  if (slot !== undefined && !slot.showLabel) {
    return `                    <IconButton
                      variant="ghost"
                      size="sm"
                      className="text-danger-11 hover:bg-danger-3"
                      aria-label="Delete"
                      disabled={deletingId === item.id}
                      onClick={${onClick}}
                    >
                      {deletingId === item.id ? <Spinner size="sm" /> : ${icon}}
                    </IconButton>`;
  }
  const iconProp = slot !== undefined ? `\n                      icon={${icon}}` : "";
  return `                    <Button
                      variant="destructive"
                      size="sm"
                      isLoading={deletingId === item.id}
                      onClick={${onClick}}${iconProp}
                    >
                      Delete
                    </Button>`;
}

/**
 * The confirmation dialog rendered once at the bottom of the list page
 * when `confirmDelete` is set — not per-row; `pendingDeleteId` (the id
 * awaiting confirmation, or `undefined`) drives which single instance is
 * open. Cancel closes it via `ModalClose`; the destructive button calls
 * the real `handleDelete` and then clears `pendingDeleteId`.
 */
function renderConfirmDeleteModal(message: string): string {
  return `
      <Modal open={pendingDeleteId !== undefined} onOpenChange={(open) => { if (!open) setPendingDeleteId(undefined); }}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Confirm delete</ModalTitle>
            <ModalDescription>${message}</ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <ModalClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </ModalClose>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (pendingDeleteId !== undefined) {
                  handleDelete(pendingDeleteId);
                }
                setPendingDeleteId(undefined);
              }}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>`;
}

/**
 * The form page's submit button (Save when editing, Create when
 * adding) — a real `<button type="submit">`, not `asChild`. Same manual
 * Spinner-swap pattern as Delete for the icon-only case, since
 * `IconButton` has no built-in `isLoading`.
 */
function renderSaveButton(slot: NormalizedIconSlot | undefined): string {
  const icon = slot !== undefined ? iconJsx(slot.icon) : "";
  if (slot !== undefined && !slot.showLabel) {
    return `          <IconButton
            type="submit"
            variant="solid"
            aria-label={isEditing ? "Save" : "Create"}
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? <Spinner size="sm" /> : ${icon}}
          </IconButton>`;
  }
  const iconProp = slot !== undefined ? `\n            icon={${icon}}` : "";
  return `          <Button type="submit" isLoading={form.formState.isSubmitting}${iconProp}>
            {isEditing ? "Save" : "Create"}
          </Button>`;
}

/** The form page's Cancel button — `asChild` wrapping an `<a>`, same pattern as Create/Edit. */
function renderCancelButton(endpoint: string, slot: NormalizedIconSlot | undefined): string {
  const icon = slot !== undefined ? iconJsx(slot.icon) : "";
  if (slot !== undefined && !slot.showLabel) {
    return `          <IconButton asChild variant="ghost" aria-label="Cancel">
            <a href="#/${endpoint}">${icon}</a>
          </IconButton>`;
  }
  return `          <Button type="button" variant="ghost" asChild>
            <a href="#/${endpoint}">${icon}Cancel</a>
          </Button>`;
}

/**
 * A string field gets `.min(1, ...)` — without it, `z.string()` accepts
 * `""`, and since the form's own default value for an untouched string
 * field is also `""` (see `defaultValueFor`), submitting the form with a
 * required field left blank silently "succeeds": no validation error, no
 * blocked submit, the request just goes out with an empty string. Number
 * and boolean fields don't get an equivalent default-boundary check here
 * — a genuinely empty number input's `valueAsNumber` is `NaN`, which
 * `z.number()` already rejects on its own (Zod treats it as a type
 * mismatch, "Expected number, received nan"), and `0`/`false` are
 * ordinary valid values for those types, not stand-ins for "not filled
 * in" the way `""` is for a required string.
 */
function zodTypeFor(type: FieldType, label: string): string {
  switch (type) {
    case "string":
      return `z.string().min(1, "${label} is required.")`;
    case "number":
      return "z.number()";
    case "boolean":
      return "z.boolean()";
  }
}

function defaultValueFor(type: FieldType): string {
  switch (type) {
    case "string":
      return '""';
    case "number":
      return "0";
    case "boolean":
      return "false";
  }
}

/** Every name derived from `typeName`, computed once and reused by every template below. */
function names(typeName: string) {
  const pascal = toPascalCase(typeName);
  return {
    pascal,
    camel: toCamelCase(pascal),
    kebab: toKebabCase(pascal),
    plural: toNaivePlural(pascal),
  };
}

export function renderResourceSchema(options: ResourceTemplateOptions): ScaffoldFile {
  const { pascal, camel, kebab } = names(options.typeName);
  const fieldLines = options.fields
    .map((field) => `  ${field.name}: ${zodTypeFor(field.type, toLabel(field.name))},`)
    .join("\n");

  const contents = `import { z } from "zod";

// Generated by \`quickadui generate resource ${pascal}\` — this file is
// yours from here on, edit it freely. Re-running the same generate
// command overwrites it, so keep any hand-written changes in mind before
// regenerating.
export const ${camel}Schema = z.object({
${fieldLines}
});

export type ${pascal}Input = z.infer<typeof ${camel}Schema>;

/** A ${pascal} as returned by the API — the input fields plus its id. */
export interface ${pascal} extends ${pascal}Input {
  readonly id: number;
}
`;

  return { path: `src/schemas/${kebab}.schema.ts`, contents };
}

export function renderResourceApi(options: ResourceTemplateOptions): ScaffoldFile {
  const { pascal, camel, kebab, plural } = names(options.typeName);
  const { endpoint, apiBase } = options;

  const contents = `import type { ${pascal}, ${pascal}Input } from "../schemas/${kebab}.schema";

// Generated by \`quickadui generate resource ${pascal}\`, pointed at
// ${apiBase}. Point --api-base at your own backend and regenerate once
// you have one — nothing else in this file needs to change, every
// function below already matches your real REST shape (GET list, GET by
// id, POST .../add, PUT .../:id, DELETE .../:id).
//
// Heads up if this is still DummyJSON: its write endpoints (add/update/
// delete below) return a successful-looking response but don't actually
// persist anything server-side — a deleted or edited row can reappear
// after a refresh. That's expected for a demo API, not a bug here.
const API_BASE = "${apiBase}";

export interface ${plural}ListResult {
  readonly total: number;
  readonly skip: number;
  readonly limit: number;
  readonly "${endpoint}": readonly ${pascal}[];
}

export interface List${plural}Options {
  readonly skip?: number;
  readonly limit?: number;
}

export async function list${plural}(options: List${plural}Options = {}): Promise<${plural}ListResult> {
  const skip = options.skip ?? 0;
  const limit = options.limit ?? 10;
  const response = await fetch(\`\${API_BASE}/${endpoint}?limit=\${limit}&skip=\${skip}\`);
  if (!response.ok) {
    throw new Error(\`Failed to load ${endpoint} (\${response.status}).\`);
  }
  return (await response.json()) as ${plural}ListResult;
}

export async function get${pascal}(id: number): Promise<${pascal}> {
  const response = await fetch(\`\${API_BASE}/${endpoint}/\${id}\`);
  if (!response.ok) {
    throw new Error(\`Failed to load ${camel} \${id} (\${response.status}).\`);
  }
  return (await response.json()) as ${pascal};
}

export async function create${pascal}(input: ${pascal}Input): Promise<${pascal}> {
  const response = await fetch(\`\${API_BASE}/${endpoint}/add\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(\`Failed to create ${camel} (\${response.status}).\`);
  }
  return (await response.json()) as ${pascal};
}

export async function update${pascal}(id: number, input: ${pascal}Input): Promise<${pascal}> {
  const response = await fetch(\`\${API_BASE}/${endpoint}/\${id}\`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(\`Failed to update ${camel} \${id} (\${response.status}).\`);
  }
  return (await response.json()) as ${pascal};
}

export async function delete${pascal}(id: number): Promise<void> {
  const response = await fetch(\`\${API_BASE}/${endpoint}/\${id}\`, { method: "DELETE" });
  if (!response.ok) {
    throw new Error(\`Failed to delete ${camel} \${id} (\${response.status}).\`);
  }
}
`;

  return { path: `src/api/${kebab}.api.ts`, contents };
}

export function renderResourceListPage(options: ResourceTemplateOptions): ScaffoldFile {
  const { pascal, kebab, plural } = names(options.typeName);
  const { endpoint, fields } = options;
  const buttonIcons = options.buttonIcons ?? {};

  const headerCells = fields
    .map((field) => `              <TableHead>${toLabel(field.name)}</TableHead>`)
    .join("\n");
  const bodyCells = fields
    .map((field) => `                <TableCell>{String(item.${field.name})}</TableCell>`)
    .join("\n");

  const createSlot = normalizeIconSlot(buttonIcons.create);
  const editSlot = normalizeIconSlot(buttonIcons.edit);
  const deleteSlot = normalizeIconSlot(buttonIcons.delete);

  const label = toLabel(pascal).toLowerCase();

  const confirmDelete = options.confirmDelete ?? false;
  const confirmDeleteOn = confirmDelete !== false;
  const confirmDeleteMessage =
    typeof confirmDelete === "string" ? confirmDelete : `Delete this ${label}? This can't be undone.`;

  const createButtonJsx = renderCreateButton(endpoint, label, createSlot);
  const editButtonJsx = renderEditButton(endpoint, editSlot);
  const deleteButtonJsx = renderDeleteButton(deleteSlot, confirmDeleteOn);
  const confirmDeleteModalJsx = confirmDeleteOn ? renderConfirmDeleteModal(confirmDeleteMessage) : "";
  const pendingDeleteIdState = confirmDeleteOn
    ? "\n  const [pendingDeleteId, setPendingDeleteId] = useState<number | undefined>(undefined);"
    : "";

  const toastsOn = options.toasts !== undefined;
  const toastMessages = toastsOn ? resolveToastMessages(options.toasts ?? {}, label) : undefined;
  const handleDeleteBody = toastMessages
    ? `  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await delete${pascal}(id);
      setItems((current) => current.filter((item) => item.id !== id));
      toast({ title: ${jsString(toastMessages.deleteSuccess)}, variant: "success" });
    } catch (cause) {
      toast({
        title: ${jsString(toastMessages.deleteError)},
        description: cause instanceof Error ? cause.message : String(cause),
        variant: "danger",
      });
    } finally {
      setDeletingId(undefined);
    }
  }`
    : `  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await delete${pascal}(id);
      setItems((current) => current.filter((item) => item.id !== id));
    } finally {
      setDeletingId(undefined);
    }
  }`;

  const needsButton =
    (createSlot === undefined || createSlot.showLabel) ||
    (editSlot === undefined || editSlot.showLabel) ||
    (deleteSlot === undefined || deleteSlot.showLabel);
  const needsIconButton =
    (createSlot !== undefined && !createSlot.showLabel) ||
    (editSlot !== undefined && !editSlot.showLabel) ||
    (deleteSlot !== undefined && !deleteSlot.showLabel);

  const iconImport = iconImportLine([createSlot?.icon, editSlot?.icon, deleteSlot?.icon]);
  const overlaysImport = overlaysImportLine(toastsOn, confirmDeleteOn);

  const contents = `${coreImportLine(needsButton, needsIconButton)}
${iconImport}${overlaysImport}import {
  getPaginationRange,
  PAGINATION_ELLIPSIS,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@quickadui/data";
import { useEffect, useState } from "react";
import { delete${pascal}, list${plural} } from "../../api/${kebab}.api";
import type { ${pascal} } from "../../schemas/${kebab}.schema";

const PAGE_SIZE = 10;

/**
 * Generated by \`quickadui generate resource ${pascal}\`. Wire this up
 * wherever your app renders pages (a router, or a simple hash switch) —
 * \`quickadui\` doesn't assume one for you. Links below point at
 * "#/${endpoint}/new" and "#/${endpoint}/:id/edit"; change them to match
 * however you end up routing.
 */
export function ${pascal}ListPage() {
  const [items, setItems] = useState<readonly ${pascal}[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<number | undefined>(undefined);${pendingDeleteIdState}

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    list${plural}({ skip, limit: PAGE_SIZE })
      .then((result) => {
        if (cancelled) {
          return;
        }
        setItems(result["${endpoint}"]);
        setTotal(result.total);
        setError(undefined);
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : String(cause));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [skip]);

${handleDeleteBody}

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.floor(skip / PAGE_SIZE) + 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-neutral-12">${toLabel(plural)}</h1>
${createButtonJsx}
      </div>

      {error && <p className="text-sm text-danger-11">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
${headerCells}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
${bodyCells}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
${editButtonJsx}
${deleteButtonJsx}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              disabled={skip === 0}
              onClick={() => setSkip((current) => Math.max(0, current - PAGE_SIZE))}
            />
          </PaginationItem>
          {getPaginationRange(currentPage, totalPages).map((page, index) =>
            page === PAGINATION_ELLIPSIS ? (
              <PaginationItem key={"ellipsis-" + index}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === currentPage}
                  onClick={() => setSkip((page - 1) * PAGE_SIZE)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ),
          )}
          <PaginationItem>
            <PaginationNext
              disabled={skip + PAGE_SIZE >= total}
              onClick={() =>
                setSkip((current) => (current + PAGE_SIZE < total ? current + PAGE_SIZE : current))
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>${confirmDeleteModalJsx}
    </div>
  );
}
`;

  return { path: `src/pages/${kebab}/${pascal}ListPage.tsx`, contents };
}

function renderFormFieldJsx(field: FieldSpec): string {
  const label = toLabel(field.name);

  if (field.type === "boolean") {
    return `        <FormField
          control={form.control}
          name="${field.name}"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
              </FormControl>
              <FormLabel className="!mt-0">${label}</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />`;
  }

  if (field.type === "number") {
    return `        <FormField
          control={form.control}
          name="${field.name}"
          render={({ field }) => (
            <FormItem>
              <FormLabel>${label}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(event) => field.onChange(event.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />`;
  }

  return `        <FormField
          control={form.control}
          name="${field.name}"
          render={({ field }) => (
            <FormItem>
              <FormLabel>${label}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />`;
}

export function renderResourceFormPage(options: ResourceTemplateOptions): ScaffoldFile {
  const { pascal, camel, kebab } = names(options.typeName);
  const { endpoint, fields } = options;
  const buttonIcons = options.buttonIcons ?? {};

  const usesCheckbox = fields.some((field) => field.type === "boolean");
  const defaultValues = fields.map((field) => `  ${field.name}: ${defaultValueFor(field.type)},`).join("\n");
  const formFields = fields.map(renderFormFieldJsx).join("\n");

  const saveSlot = normalizeIconSlot(buttonIcons.save);
  const cancelSlot = normalizeIconSlot(buttonIcons.cancel);

  const saveButtonJsx = renderSaveButton(saveSlot);
  const cancelButtonJsx = renderCancelButton(endpoint, cancelSlot);

  const needsButton = (saveSlot === undefined || saveSlot.showLabel) || (cancelSlot === undefined || cancelSlot.showLabel);
  const needsIconButton =
    (saveSlot !== undefined && !saveSlot.showLabel) || (cancelSlot !== undefined && !cancelSlot.showLabel);

  const iconImport = iconImportLine([saveSlot?.icon, cancelSlot?.icon]);

  const label = toLabel(pascal).toLowerCase();
  const toastsOn = options.toasts !== undefined;
  const toastMessages = toastsOn ? resolveToastMessages(options.toasts ?? {}, label) : undefined;
  const onSubmitBody = toastMessages
    ? `  async function onSubmit(values: ${pascal}Input) {
    setSubmitError(undefined);
    try {
      if (${camel}Id !== undefined) {
        await update${pascal}(${camel}Id, values);
        toast({ title: ${jsString(toastMessages.updateSuccess)}, variant: "success" });
      } else {
        await create${pascal}(values);
        toast({ title: ${jsString(toastMessages.createSuccess)}, variant: "success" });
      }
      window.location.hash = "#/${endpoint}";
    } catch (cause) {
      setSubmitError(cause instanceof Error ? cause.message : String(cause));
      toast({
        title: isEditing ? ${jsString(toastMessages.updateError)} : ${jsString(toastMessages.createError)},
        description: cause instanceof Error ? cause.message : String(cause),
        variant: "danger",
      });
    }
  }`
    : `  async function onSubmit(values: ${pascal}Input) {
    setSubmitError(undefined);
    try {
      if (${camel}Id !== undefined) {
        await update${pascal}(${camel}Id, values);
      } else {
        await create${pascal}(values);
      }
      window.location.hash = "#/${endpoint}";
    } catch (cause) {
      setSubmitError(cause instanceof Error ? cause.message : String(cause));
    }
  }`;
  const overlaysImport = overlaysImportLine(toastsOn, false);

  const contents = `${coreImportLine(needsButton, needsIconButton)}
${iconImport}${overlaysImport}import {
${usesCheckbox ? "  Checkbox,\n" : ""}  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  useForm,
  zodResolver,
} from "@quickadui/forms";
import { useEffect, useState } from "react";
import { create${pascal}, get${pascal}, update${pascal} } from "../../api/${kebab}.api";
import { ${camel}Schema, type ${pascal}Input } from "../../schemas/${kebab}.schema";

export interface ${pascal}FormPageProps {
  /** Pass an existing id to edit that ${camel}; omit it to create a new one. */
  readonly ${camel}Id?: number;
}

const DEFAULT_VALUES: ${pascal}Input = {
${defaultValues}
};

/**
 * Generated by \`quickadui generate resource ${pascal}\` — one component
 * for both create and edit, following \`${camel}Id\`. Navigates back to
 * "#/${endpoint}" on success; adjust that (and how this page itself gets
 * rendered) to match your own routing.
 */
export function ${pascal}FormPage({ ${camel}Id }: ${pascal}FormPageProps) {
  const isEditing = ${camel}Id !== undefined;
  const [loading, setLoading] = useState(isEditing);
  const [submitError, setSubmitError] = useState<string | undefined>(undefined);

  const form = useForm<${pascal}Input>({
    resolver: zodResolver(${camel}Schema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (${camel}Id === undefined) {
      return;
    }
    let cancelled = false;
    get${pascal}(${camel}Id)
      .then((item) => {
        if (!cancelled) {
          form.reset(item);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
    // \`form\` is intentionally left out of the dependency list — it's a
    // stable object from useForm(), and including it here would re-run
    // this effect (and re-fetch) on every render instead of only when
    // ${camel}Id changes.
  }, [${camel}Id]);

${onSubmitBody}

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex max-w-md flex-col gap-4">
        <h1 className="text-lg font-semibold text-neutral-12">
          {isEditing ? "Edit ${toLabel(pascal).toLowerCase()}" : "New ${toLabel(pascal).toLowerCase()}"}
        </h1>

${formFields}

        {submitError && <p className="text-sm text-danger-11">{submitError}</p>}

        <div className="flex gap-2">
${saveButtonJsx}
${cancelButtonJsx}
        </div>
      </form>
    </Form>
  );
}
`;

  return { path: `src/pages/${kebab}/${pascal}FormPage.tsx`, contents };
}

/**
 * All four files `generate resource` writes, as pure (path, contents)
 * pairs — `commands/generate-resource.ts` is the only place that touches
 * the filesystem, same split as `templates.ts`/`commands/init.ts`.
 */
export function renderResourceFiles(options: ResourceTemplateOptions): readonly ScaffoldFile[] {
  return [
    renderResourceSchema(options),
    renderResourceApi(options),
    renderResourceListPage(options),
    renderResourceFormPage(options),
  ];
}
