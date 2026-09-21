// The declarative alternative to chaining `add`/`generate resource`/
// `generate auth`/`generate app` by hand: one JSON file describing the
// whole app (resources, auth, navbar/sidebar/footer, dashboard), parsed
// and validated here into a typed `QuickaduiConfig` that `commands/apply.ts`
// (not yet written) will hand off to the *same* generator functions
// `generate resource`/`generate auth`/`generate app` already use —
// this file only parses and validates, it never touches the filesystem
// and never decides what to generate from a valid config.
//
// Validation follows `field-spec.ts`'s standing rule: name the exact bad
// entry in the error, never a vague "invalid config". Every cross-
// reference a person could plausibly typo (a view listing a field name
// the resource doesn't declare, a dashboard widget naming a resource that
// doesn't exist, an action's `role` outside the declared `auth.roles`) is
// checked here, at parse time — catching it before any file gets written
// is much cheaper than debugging a generated app that silently omitted a
// field.

export type ThemeMode = "light" | "dark" | "system";
export type FieldType = "string" | "number" | "boolean";
export type ActionKind = "navigate" | "submit" | "delete" | "custom";
export type DashboardWidgetType = "stat" | "list";

const THEME_MODES: readonly ThemeMode[] = ["light", "dark", "system"];
const FIELD_TYPES: readonly FieldType[] = ["string", "number", "boolean"];
const ACTION_KINDS: readonly ActionKind[] = ["navigate", "submit", "delete", "custom"];
const DASHBOARD_WIDGET_TYPES: readonly DashboardWidgetType[] = ["stat", "list"];
const DASHBOARD_COLUMNS = [1, 2, 3, 4] as const;

export interface QuickaduiConfigProject {
  readonly name?: string;
  /** Default API base for every resource/auth that doesn't override it. Falls back to the same DummyJSON demo API `generate resource`/`generate auth` already default to. */
  readonly apiBase?: string;
}

export type ColorFamily = "accent" | "neutral" | "success" | "warning" | "danger";

const COLOR_FAMILIES: readonly ColorFamily[] = ["accent", "neutral", "success", "warning", "danger"];

/**
 * Brand color overrides, one `#RRGGBB` hex seed per family — matches
 * `@quickadui/tokens`' own `SEED_COLORS`/`ColorFamily` exactly (`accent`
 * is the one every generated app's buttons/links use; the rest are
 * semantic — success/warning/danger). Wired straight into
 * `<ThemeProvider defaultColors={...}>` (see `theme-provider.tsx`), which
 * regenerates that family's full 12-step light+dark scale from the seed
 * at runtime — no rebuild needed. Every family is independently
 * optional; an unset family keeps `@quickadui/tokens`' own build-time
 * color (`accent: "#C85A1B"`, an orange, is why a generated app looks
 * orange by default with no `theme.colors` set at all).
 */
export interface QuickaduiConfigThemeColors {
  readonly accent?: string;
  readonly neutral?: string;
  readonly success?: string;
  readonly warning?: string;
  readonly danger?: string;
}

export interface QuickaduiConfigTheme {
  /** Wired into `<ThemeProvider defaultTheme={...}>` — only matters on a visitor's very first visit, before anything is stored (see `ThemeProviderProps.defaultTheme`'s own doc comment); afterward their own light/dark/system choice, made via the generated app's own theme toggle, always wins. */
  readonly default?: ThemeMode;
  readonly colors?: QuickaduiConfigThemeColors;
}

export interface QuickaduiConfigAuth {
  readonly enabled: boolean;
  readonly apiBase?: string;
  /**
   * The full set of roles this app knows about. Every `role` list used
   * anywhere else in the config (an action, a nav item) must be a subset
   * of this — an unknown role name is almost always a typo, so it's
   * rejected at parse time rather than silently never matching anyone.
   */
  readonly roles?: readonly string[];
  /**
   * Which field of the authenticated user object carries their role.
   * Verified against the real DummyJSON API (not assumed): its
   * `GET /auth/me` "who am I" response — what the generated
   * `auth-client.ts` already calls — is only documented up to
   * `id/username/email/firstName/lastName/gender/image`, with an
   * unspecified "...other user fields" note, so a role field there isn't
   * guaranteed. `GET /users/{id}` *is* documented to include `"role":
   * "admin"|"moderator"|"user"`, so generated code backing this field
   * will fetch that endpoint specifically for the role, not rely on
   * `/auth/me` alone. Defaults to `"role"`.
   */
  readonly roleField?: string;
}

export interface QuickaduiConfigField {
  readonly name: string;
  readonly type: FieldType;
  /** Defaults to a sentence-cased version of `name`. */
  readonly label?: string;
}

export interface QuickaduiConfigAction {
  readonly label: string;
  /** One of `@quickadui/icons`' exported names (`"Plus"`, `"Trash"`, `"Settings"`, ...), without the `Icon` suffix. */
  readonly icon?: string;
  /** Rendered/enabled only for these roles. Omit for "everyone". Every entry must be declared in `auth.roles`. */
  readonly role?: readonly string[];
  /** Must be logged in to see/use this action. Independent of `role` — an action can require auth without requiring a specific role. */
  readonly requiresAuth?: boolean;
  readonly kind: ActionKind;
  /** For `kind: "navigate"` — `"list"`/`"create"`/`"update"` (relative to the same resource) or a raw href. Required for `"navigate"`. */
  readonly to?: string;
  /** For `kind: "delete"` — show a confirmation prompt first. Default: `true`. */
  readonly confirm?: boolean;
  /**
   * Deliberately NOT a config field: every `"submit"`/`"delete"` action's
   * `Button` automatically gets `isLoading` wired to that action's
   * pending state (using `@quickadui/core`'s `Spinner`, already wired
   * into `Button` — see button.tsx) — it's a code-generation rule, not
   * something to author per action. `"navigate"` actions have no async
   * state, so it never applies to them.
   */
  readonly __isLoadingIsAutomaticNotConfigurable?: never;
}

export interface QuickaduiConfigView {
  /** Field names (must exist in the resource's own `fields`), in display/form order. */
  readonly fields: readonly string[];
  readonly actions?: readonly QuickaduiConfigAction[];
  readonly requiresAuth?: boolean;
}

export interface QuickaduiConfigResourceViews {
  readonly list?: QuickaduiConfigView;
  readonly create?: QuickaduiConfigView;
  readonly update?: QuickaduiConfigView;
}

/**
 * One button's icon config. Either just the icon name (a plain string —
 * the button keeps its visible text, icon added alongside it, exactly
 * like before this shape existed) or an object with `showLabel: false`
 * to drop the text entirely and render icon-only, using
 * `@quickadui/core`'s `IconButton` instead of `Button` — the button's
 * usual text becomes an `aria-label` instead, so it stays accessible
 * with no visible label. Each `icon` is one of `@quickadui/icons`'
 * exported names without the `Icon` suffix (e.g. `"Plus"` for
 * `PlusIcon`), not verified against the real package's export list here
 * (this CLI doesn't depend on `@quickadui/icons` at build time), so a
 * typo surfaces as a broken import in the *generated* project, not at
 * config-validation time — same caveat as `QuickaduiConfigNavItem.icon`.
 *
 * Real gap, not hidden: `IconButton` has no `"destructive"` variant
 * (only `"solid"`/`"soft"`/`"outline"`/`"ghost"`), unlike `Button`. The
 * generated icon-only Delete button falls back to `variant="ghost"` plus
 * a danger-colored `className` to keep the same visual intent — see
 * `resource-templates.ts`.
 */
export interface QuickaduiConfigResourceButtonIconConfig {
  readonly icon: string;
  /** Defaults to `true` (icon + visible text, today's only behavior before this field existed). Set `false` for icon-only. */
  readonly showLabel?: boolean;
}

export type QuickaduiConfigResourceButtonIconSlot = string | QuickaduiConfigResourceButtonIconConfig;

/**
 * Icons for the five standard buttons `generate resource` always
 * produces (the list page's "New X" button and each row's Edit/Delete,
 * plus the form page's Save/Create and Cancel buttons) — every field is
 * optional and independent: a button whose icon is left unset here stays
 * text-only, exactly like today.
 *
 * This is deliberately a fixed, flat set of five slots tied to the
 * buttons `generate resource` already hardcodes — not the same thing as
 * `QuickaduiConfigAction.icon` on `views[].actions`, which describes an
 * arbitrary, config-authored action list that isn't generated at all yet
 * (see `apply.ts`'s `warnings`). This one *is* wired into codegen today;
 * that one isn't, yet.
 */
export interface QuickaduiConfigResourceButtonIcons {
  /** The list page's "New X" button. */
  readonly create?: QuickaduiConfigResourceButtonIconSlot;
  /** Each row's Edit button. */
  readonly edit?: QuickaduiConfigResourceButtonIconSlot;
  /** Each row's Delete button. */
  readonly delete?: QuickaduiConfigResourceButtonIconSlot;
  /** The form page's submit button (Save when editing, Create when adding). */
  readonly save?: QuickaduiConfigResourceButtonIconSlot;
  /** The form page's Cancel button. */
  readonly cancel?: QuickaduiConfigResourceButtonIconSlot;
}

/**
 * Toast messages for this resource's create/update/delete outcomes,
 * shown via `@quickadui/overlays`' global `toast()` — wired into the
 * generated list page's Delete flow and the form page's Create/Update
 * submit. Every key is independently optional: setting `toasts` at all
 * (even just one key) turns toast behavior *on* for this resource, and
 * any key left unset falls back to a generic default message built from
 * the resource's own label (e.g. "Product created.", "Failed to delete
 * product.") rather than staying silent — so a config author doesn't
 * have to write all six just to get toasts on every action. Omitting
 * `toasts` entirely keeps today's default: no toasts, errors only shown
 * inline (list page) or via `submitError` text (form page), exactly as
 * before this feature existed.
 */
export interface QuickaduiConfigResourceToasts {
  readonly createSuccess?: string;
  readonly createError?: string;
  readonly updateSuccess?: string;
  readonly updateError?: string;
  readonly deleteSuccess?: string;
  readonly deleteError?: string;
}

export interface QuickaduiConfigResource {
  readonly name: string;
  /** Defaults to a naive plural of `name`, kebab-cased — same default as `generate resource --endpoint`. */
  readonly endpoint?: string;
  /** Overrides `project.apiBase` for this resource only. */
  readonly apiBase?: string;
  readonly fields: readonly QuickaduiConfigField[];
  /** Omit entirely for today's default behavior: every field in every view, in declaration order — matches plain `generate resource --fields`. */
  readonly views?: QuickaduiConfigResourceViews;
  /** Omit entirely for today's default behavior: every standard button stays text-only. */
  readonly buttonIcons?: QuickaduiConfigResourceButtonIcons;
  /** Omit entirely for today's default: no toasts. */
  readonly toasts?: QuickaduiConfigResourceToasts;
  /**
   * Shows a confirmation dialog (`@quickadui/overlays`' `Modal`) before
   * actually deleting a row. `true` uses a generic default message built
   * from the resource's label ("Delete this product? This can't be
   * undone."); a string replaces that message with your own; `false` or
   * omitted keeps today's default — Delete fires immediately, no
   * confirmation.
   */
  readonly confirmDelete?: boolean | string;
}

export interface QuickaduiConfigNavItem {
  readonly label: string;
  readonly href: string;
  /** Validated (must be a subset of `auth.roles`) but not yet enforced in generated code — see `apply.ts`'s `warnings`. */
  readonly role?: readonly string[];
  /** Validated but not yet enforced in generated code — see `apply.ts`'s `warnings`. */
  readonly requiresAuth?: boolean;
  /**
   * One of `@quickadui/icons`' exported names, without the `Icon` suffix
   * (e.g. `"Home"` for `HomeIcon`) — not verified against the real
   * package's export list here (this CLI doesn't depend on
   * `@quickadui/icons` at build time), so a typo surfaces as a broken
   * import in the *generated* project, not at config-validation time.
   * Unlike `role`/`requiresAuth` above, this one **is** wired into
   * `generate app`'s codegen (via `nav-items.ts`'s `NavItem.icon`) —
   * rendered as `<XIcon size={16} aria-hidden />` next to the label.
   */
  readonly icon?: string;
}

export interface QuickaduiConfigNav {
  readonly enabled: boolean;
  /** Shown in the brand slot (`NavbarBrand`/`SidebarHeader`). Omit for today's default: the target project's own `package.json` "name". Ignored when `logo` is also set (see below), except as that image's `alt` text. */
  readonly brand?: string;
  /**
   * A path or URL to an image (e.g. `"/logo.svg"` for a file in your
   * project's `public/` folder, or a full `https://` URL) shown instead
   * of the `brand` text. This CLI never copies or generates any image
   * file itself — make sure whatever you point this at actually resolves
   * at runtime, the same "you own your own assets" expectation
   * `resources[].buttonIcons`/nav item `icon`s already carry for
   * `@quickadui/icons` names, just for an arbitrary file instead of a
   * package export.
   */
  readonly logo?: string;
  /** Omit for today's default behavior: one item per generated resource/auth page, auto-derived — same as `generate app`'s own default. */
  readonly items?: readonly QuickaduiConfigNavItem[];
}

export interface QuickaduiConfigFooter {
  readonly enabled: boolean;
  /** Defaults to `"© <year> <project name>"`, same as today's hardcoded generated footer. */
  readonly content?: string;
}

export interface QuickaduiConfigDashboardWidget {
  readonly id: string;
  readonly type: DashboardWidgetType;
  readonly title: string;
  /** Must match a `resources[].name`. */
  readonly resource: string;
  /** For `type: "stat"` — the only metric implemented so far. Default: `"count"`. */
  readonly metric?: "count";
  /** For `type: "list"` — how many rows to show. Default: `5`. */
  readonly limit?: number;
  readonly icon?: string;
}

export interface QuickaduiConfigDashboard {
  readonly enabled: boolean;
  /** Default: `"#/"`. */
  readonly route?: string;
  readonly columns?: (typeof DASHBOARD_COLUMNS)[number];
  readonly widgets?: readonly QuickaduiConfigDashboardWidget[];
}

export interface QuickaduiConfig {
  readonly project?: QuickaduiConfigProject;
  readonly theme?: QuickaduiConfigTheme;
  readonly auth?: QuickaduiConfigAuth;
  readonly resources: readonly QuickaduiConfigResource[];
  readonly navbar?: QuickaduiConfigNav;
  readonly sidebar?: QuickaduiConfigNav;
  readonly footer?: QuickaduiConfigFooter;
  readonly dashboard?: QuickaduiConfigDashboard;
}

function fail(path: string, message: string): never {
  throw new Error(`Invalid quickadui config at "${path}": ${message}`);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

function expectString(value: unknown, path: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    fail(path, `expected a non-empty string, got ${JSON.stringify(value)}.`);
  }
  return value;
}

function expectBoolean(value: unknown, path: string): boolean {
  if (typeof value !== "boolean") {
    fail(path, `expected a boolean, got ${JSON.stringify(value)}.`);
  }
  return value;
}

function expectOneOf<T extends string>(value: unknown, allowed: readonly T[], path: string): T {
  if (typeof value !== "string" || !(allowed as readonly string[]).includes(value)) {
    fail(path, `expected one of ${allowed.map((v) => `"${v}"`).join(", ")}, got ${JSON.stringify(value)}.`);
  }
  return value as T;
}

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

/** Matches `@quickadui/theme`'s own `isHexColor` (color-runtime.ts) — validating here, at config-parse time, means a bad hex fails loudly with the exact bad path instead of silently no-op'ing (or throwing from inside `setColor`) deep in the generated app at runtime. */
function expectHexColor(value: unknown, path: string): string {
  if (typeof value !== "string" || !HEX_COLOR_PATTERN.test(value)) {
    fail(path, `expected a "#RRGGBB" hex color, got ${JSON.stringify(value)}.`);
  }
  return value;
}

function parseThemeColors(raw: unknown, path: string): QuickaduiConfigThemeColors {
  if (!isPlainObject(raw)) {
    fail(path, "expected an object with optional \"accent\"/\"neutral\"/\"success\"/\"warning\"/\"danger\" keys, each a \"#RRGGBB\" hex color.");
  }
  const result: Record<string, string> = {};
  for (const family of COLOR_FAMILIES) {
    if (raw[family] !== undefined) {
      result[family] = expectHexColor(raw[family], `${path}.${family}`);
    }
  }
  return result as QuickaduiConfigThemeColors;
}

function parseField(raw: unknown, path: string): QuickaduiConfigField {
  if (!isPlainObject(raw)) {
    fail(path, "expected an object with \"name\" and \"type\".");
  }
  const name = expectString(raw.name, `${path}.name`);
  const type = expectOneOf(raw.type, FIELD_TYPES, `${path}.type`);
  const label = raw.label === undefined ? undefined : expectString(raw.label, `${path}.label`);
  return label === undefined ? { name, type } : { name, type, label };
}

function parseAction(raw: unknown, path: string, knownRoles: readonly string[] | undefined): QuickaduiConfigAction {
  if (!isPlainObject(raw)) {
    fail(path, "expected an object with \"label\" and \"kind\".");
  }
  const label = expectString(raw.label, `${path}.label`);
  const kind = expectOneOf(raw.kind, ACTION_KINDS, `${path}.kind`);

  if (kind === "navigate" && (raw.to === undefined || raw.to === "")) {
    fail(path, `action "${label}" has kind "navigate" but no "to" — required for this kind.`);
  }

  const icon = raw.icon === undefined ? undefined : expectString(raw.icon, `${path}.icon`);
  const to = raw.to === undefined ? undefined : expectString(raw.to, `${path}.to`);
  const requiresAuth = raw.requiresAuth === undefined ? undefined : expectBoolean(raw.requiresAuth, `${path}.requiresAuth`);
  const confirm = raw.confirm === undefined ? undefined : expectBoolean(raw.confirm, `${path}.confirm`);

  let role: readonly string[] | undefined;
  if (raw.role !== undefined) {
    if (!isStringArray(raw.role)) {
      fail(path, `"role" must be an array of strings, got ${JSON.stringify(raw.role)}.`);
    }
    for (const r of raw.role) {
      if (knownRoles === undefined || !knownRoles.includes(r)) {
        fail(
          `${path}.role`,
          `role "${r}" isn't declared in "auth.roles" (${knownRoles === undefined ? "which is empty/unset" : knownRoles.map((x) => `"${x}"`).join(", ")}). Add it there first, or fix the typo.`,
        );
      }
    }
    role = raw.role;
  }

  return {
    label,
    kind,
    ...(icon !== undefined ? { icon } : {}),
    ...(to !== undefined ? { to } : {}),
    ...(requiresAuth !== undefined ? { requiresAuth } : {}),
    ...(confirm !== undefined ? { confirm } : {}),
    ...(role !== undefined ? { role } : {}),
  };
}

function parseView(
  raw: unknown,
  path: string,
  fieldNames: readonly string[],
  knownRoles: readonly string[] | undefined,
): QuickaduiConfigView {
  if (!isPlainObject(raw)) {
    fail(path, "expected an object with a \"fields\" array.");
  }
  if (!isStringArray(raw.fields)) {
    fail(`${path}.fields`, `expected an array of field names, got ${JSON.stringify(raw.fields)}.`);
  }
  for (const name of raw.fields) {
    if (!fieldNames.includes(name)) {
      fail(
        `${path}.fields`,
        `references field "${name}", which isn't declared in this resource's own "fields" list (${fieldNames.map((n) => `"${n}"`).join(", ")}).`,
      );
    }
  }
  const requiresAuth = raw.requiresAuth === undefined ? undefined : expectBoolean(raw.requiresAuth, `${path}.requiresAuth`);
  let actions: readonly QuickaduiConfigAction[] | undefined;
  if (raw.actions !== undefined) {
    if (!Array.isArray(raw.actions)) {
      fail(`${path}.actions`, `expected an array, got ${JSON.stringify(raw.actions)}.`);
    }
    actions = raw.actions.map((entry, i) => parseAction(entry, `${path}.actions[${i}]`, knownRoles));
  }
  return {
    fields: raw.fields,
    ...(actions !== undefined ? { actions } : {}),
    ...(requiresAuth !== undefined ? { requiresAuth } : {}),
  };
}

function parseButtonIconSlot(raw: unknown, path: string): QuickaduiConfigResourceButtonIconSlot {
  if (typeof raw === "string") {
    return expectString(raw, path);
  }
  if (isPlainObject(raw)) {
    const icon = expectString(raw.icon, `${path}.icon`);
    const showLabel = raw.showLabel === undefined ? undefined : expectBoolean(raw.showLabel, `${path}.showLabel`);
    return showLabel !== undefined ? { icon, showLabel } : { icon };
  }
  fail(
    path,
    `expected a string (icon name) or an object like { "icon": "Trash", "showLabel": false }, got ${JSON.stringify(raw)}.`,
  );
}

function parseResourceButtonIcons(raw: unknown, path: string): QuickaduiConfigResourceButtonIcons {
  if (!isPlainObject(raw)) {
    fail(path, "expected an object with optional \"create\"/\"edit\"/\"delete\"/\"save\"/\"cancel\" keys.");
  }
  const create = raw.create === undefined ? undefined : parseButtonIconSlot(raw.create, `${path}.create`);
  const edit = raw.edit === undefined ? undefined : parseButtonIconSlot(raw.edit, `${path}.edit`);
  const del = raw.delete === undefined ? undefined : parseButtonIconSlot(raw.delete, `${path}.delete`);
  const save = raw.save === undefined ? undefined : parseButtonIconSlot(raw.save, `${path}.save`);
  const cancel = raw.cancel === undefined ? undefined : parseButtonIconSlot(raw.cancel, `${path}.cancel`);
  return {
    ...(create !== undefined ? { create } : {}),
    ...(edit !== undefined ? { edit } : {}),
    ...(del !== undefined ? { delete: del } : {}),
    ...(save !== undefined ? { save } : {}),
    ...(cancel !== undefined ? { cancel } : {}),
  };
}

function parseResourceToasts(raw: unknown, path: string): QuickaduiConfigResourceToasts {
  if (!isPlainObject(raw)) {
    fail(
      path,
      "expected an object with optional \"createSuccess\"/\"createError\"/\"updateSuccess\"/\"updateError\"/\"deleteSuccess\"/\"deleteError\" string keys.",
    );
  }
  const keys = ["createSuccess", "createError", "updateSuccess", "updateError", "deleteSuccess", "deleteError"] as const;
  const result: Record<string, string> = {};
  for (const key of keys) {
    if (raw[key] !== undefined) {
      result[key] = expectString(raw[key], `${path}.${key}`);
    }
  }
  return result as QuickaduiConfigResourceToasts;
}

function parseConfirmDelete(raw: unknown, path: string): boolean | string {
  if (typeof raw === "boolean") {
    return raw;
  }
  if (typeof raw === "string" && raw.trim() !== "") {
    return raw;
  }
  fail(path, `expected a boolean or a non-empty string, got ${JSON.stringify(raw)}.`);
}

function parseResource(raw: unknown, path: string, knownRoles: readonly string[] | undefined): QuickaduiConfigResource {
  if (!isPlainObject(raw)) {
    fail(path, "expected an object with \"name\" and \"fields\".");
  }
  const name = expectString(raw.name, `${path}.name`);
  const endpoint = raw.endpoint === undefined ? undefined : expectString(raw.endpoint, `${path}.endpoint`);
  const apiBase = raw.apiBase === undefined ? undefined : expectString(raw.apiBase, `${path}.apiBase`);

  if (!Array.isArray(raw.fields) || raw.fields.length === 0) {
    fail(`${path}.fields`, "expected a non-empty array of fields.");
  }
  const fields = raw.fields.map((entry, i) => parseField(entry, `${path}.fields[${i}]`));
  const fieldNames = fields.map((f) => f.name);
  const seen = new Set<string>();
  for (const fieldName of fieldNames) {
    if (seen.has(fieldName)) {
      fail(`${path}.fields`, `duplicate field name "${fieldName}".`);
    }
    seen.add(fieldName);
  }

  let views: QuickaduiConfigResourceViews | undefined;
  if (raw.views !== undefined) {
    if (!isPlainObject(raw.views)) {
      fail(`${path}.views`, "expected an object with optional \"list\"/\"create\"/\"update\" keys.");
    }
    const list = raw.views.list === undefined ? undefined : parseView(raw.views.list, `${path}.views.list`, fieldNames, knownRoles);
    const create = raw.views.create === undefined ? undefined : parseView(raw.views.create, `${path}.views.create`, fieldNames, knownRoles);
    const update = raw.views.update === undefined ? undefined : parseView(raw.views.update, `${path}.views.update`, fieldNames, knownRoles);
    views = {
      ...(list !== undefined ? { list } : {}),
      ...(create !== undefined ? { create } : {}),
      ...(update !== undefined ? { update } : {}),
    };
  }

  const buttonIcons =
    raw.buttonIcons === undefined ? undefined : parseResourceButtonIcons(raw.buttonIcons, `${path}.buttonIcons`);
  const toasts = raw.toasts === undefined ? undefined : parseResourceToasts(raw.toasts, `${path}.toasts`);
  const confirmDelete =
    raw.confirmDelete === undefined ? undefined : parseConfirmDelete(raw.confirmDelete, `${path}.confirmDelete`);

  return {
    name,
    fields,
    ...(endpoint !== undefined ? { endpoint } : {}),
    ...(apiBase !== undefined ? { apiBase } : {}),
    ...(views !== undefined ? { views } : {}),
    ...(buttonIcons !== undefined ? { buttonIcons } : {}),
    ...(toasts !== undefined ? { toasts } : {}),
    ...(confirmDelete !== undefined ? { confirmDelete } : {}),
  };
}

function parseNavItem(raw: unknown, path: string, knownRoles: readonly string[] | undefined): QuickaduiConfigNavItem {
  if (!isPlainObject(raw)) {
    fail(path, "expected an object with \"label\" and \"href\".");
  }
  const label = expectString(raw.label, `${path}.label`);
  const href = expectString(raw.href, `${path}.href`);
  const requiresAuth = raw.requiresAuth === undefined ? undefined : expectBoolean(raw.requiresAuth, `${path}.requiresAuth`);
  const icon = raw.icon === undefined ? undefined : expectString(raw.icon, `${path}.icon`);
  let role: readonly string[] | undefined;
  if (raw.role !== undefined) {
    if (!isStringArray(raw.role)) {
      fail(path, `"role" must be an array of strings, got ${JSON.stringify(raw.role)}.`);
    }
    for (const r of raw.role) {
      if (knownRoles === undefined || !knownRoles.includes(r)) {
        fail(`${path}.role`, `role "${r}" isn't declared in "auth.roles".`);
      }
    }
    role = raw.role;
  }
  return {
    label,
    href,
    ...(requiresAuth !== undefined ? { requiresAuth } : {}),
    ...(role !== undefined ? { role } : {}),
    ...(icon !== undefined ? { icon } : {}),
  };
}

function parseNav(raw: unknown, path: string, knownRoles: readonly string[] | undefined): QuickaduiConfigNav {
  if (!isPlainObject(raw)) {
    fail(path, "expected an object with at least \"enabled\".");
  }
  const enabled = expectBoolean(raw.enabled, `${path}.enabled`);
  const brand = raw.brand === undefined ? undefined : expectString(raw.brand, `${path}.brand`);
  const logo = raw.logo === undefined ? undefined : expectString(raw.logo, `${path}.logo`);
  let items: readonly QuickaduiConfigNavItem[] | undefined;
  if (raw.items !== undefined) {
    if (!Array.isArray(raw.items)) {
      fail(`${path}.items`, `expected an array, got ${JSON.stringify(raw.items)}.`);
    }
    items = raw.items.map((entry, i) => parseNavItem(entry, `${path}.items[${i}]`, knownRoles));
  }
  return {
    enabled,
    ...(brand !== undefined ? { brand } : {}),
    ...(logo !== undefined ? { logo } : {}),
    ...(items !== undefined ? { items } : {}),
  };
}

function parseDashboardWidget(raw: unknown, path: string, resourceNames: readonly string[]): QuickaduiConfigDashboardWidget {
  if (!isPlainObject(raw)) {
    fail(path, "expected an object with \"id\", \"type\", \"title\", \"resource\".");
  }
  const id = expectString(raw.id, `${path}.id`);
  const type = expectOneOf(raw.type, DASHBOARD_WIDGET_TYPES, `${path}.type`);
  const title = expectString(raw.title, `${path}.title`);
  const resource = expectString(raw.resource, `${path}.resource`);
  if (!resourceNames.includes(resource)) {
    fail(
      `${path}.resource`,
      `references resource "${resource}", which isn't declared in "resources" (${resourceNames.map((n) => `"${n}"`).join(", ")}).`,
    );
  }
  const icon = raw.icon === undefined ? undefined : expectString(raw.icon, `${path}.icon`);
  const metric = raw.metric === undefined ? undefined : expectOneOf(raw.metric, ["count"] as const, `${path}.metric`);
  let limit: number | undefined;
  if (raw.limit !== undefined) {
    if (typeof raw.limit !== "number" || !Number.isInteger(raw.limit) || raw.limit <= 0) {
      fail(`${path}.limit`, `expected a positive integer, got ${JSON.stringify(raw.limit)}.`);
    }
    limit = raw.limit;
  }
  return {
    id,
    type,
    title,
    resource,
    ...(metric !== undefined ? { metric } : {}),
    ...(limit !== undefined ? { limit } : {}),
    ...(icon !== undefined ? { icon } : {}),
  };
}

/**
 * Parses and validates a `quickadui.config.json`-shaped value (already
 * `JSON.parse`d — this function doesn't read files) into a
 * `QuickaduiConfig`, or throws with a message naming the exact bad path
 * (`"resources[0].views.list.fields"`, not "invalid config"). Doesn't
 * write anything or generate anything itself — `commands/apply.ts` is
 * what turns a valid `QuickaduiConfig` into files, by calling the same
 * `runGenerateResource`/`runGenerateAuth`/`runGenerateApp` functions
 * `generate resource`/`generate auth`/`generate app` already use.
 */
export function parseQuickaduiConfig(raw: unknown): QuickaduiConfig {
  if (!isPlainObject(raw)) {
    fail("$", "expected a JSON object at the top level.");
  }

  const project =
    raw.project === undefined
      ? undefined
      : (() => {
          if (!isPlainObject(raw.project)) {
            fail("project", "expected an object.");
          }
          const name = raw.project.name === undefined ? undefined : expectString(raw.project.name, "project.name");
          const apiBase =
            raw.project.apiBase === undefined ? undefined : expectString(raw.project.apiBase, "project.apiBase");
          return { ...(name !== undefined ? { name } : {}), ...(apiBase !== undefined ? { apiBase } : {}) };
        })();

  const theme =
    raw.theme === undefined
      ? undefined
      : (() => {
          if (!isPlainObject(raw.theme)) {
            fail("theme", "expected an object.");
          }
          const defaultMode =
            raw.theme.default === undefined ? undefined : expectOneOf(raw.theme.default, THEME_MODES, "theme.default");
          const colors =
            raw.theme.colors === undefined ? undefined : parseThemeColors(raw.theme.colors, "theme.colors");
          return {
            ...(defaultMode !== undefined ? { default: defaultMode } : {}),
            ...(colors !== undefined ? { colors } : {}),
          };
        })();

  let auth: QuickaduiConfigAuth | undefined;
  let knownRoles: readonly string[] | undefined;
  if (raw.auth !== undefined) {
    if (!isPlainObject(raw.auth)) {
      fail("auth", "expected an object with at least \"enabled\".");
    }
    const enabled = expectBoolean(raw.auth.enabled, "auth.enabled");
    const apiBase = raw.auth.apiBase === undefined ? undefined : expectString(raw.auth.apiBase, "auth.apiBase");
    const roleField = raw.auth.roleField === undefined ? undefined : expectString(raw.auth.roleField, "auth.roleField");
    if (raw.auth.roles !== undefined) {
      if (!isStringArray(raw.auth.roles)) {
        fail("auth.roles", `expected an array of strings, got ${JSON.stringify(raw.auth.roles)}.`);
      }
      knownRoles = raw.auth.roles;
    }
    auth = {
      enabled,
      ...(apiBase !== undefined ? { apiBase } : {}),
      ...(knownRoles !== undefined ? { roles: knownRoles } : {}),
      ...(roleField !== undefined ? { roleField } : {}),
    };
  }

  if (!Array.isArray(raw.resources)) {
    fail("resources", `expected a non-empty array, got ${JSON.stringify(raw.resources)}.`);
  }
  const resources = raw.resources.map((entry, i) => parseResource(entry, `resources[${i}]`, knownRoles));
  const resourceNames = resources.map((r) => r.name);
  const seenResourceNames = new Set<string>();
  for (const name of resourceNames) {
    if (seenResourceNames.has(name)) {
      fail("resources", `duplicate resource name "${name}".`);
    }
    seenResourceNames.add(name);
  }

  const navbar = raw.navbar === undefined ? undefined : parseNav(raw.navbar, "navbar", knownRoles);
  const sidebar = raw.sidebar === undefined ? undefined : parseNav(raw.sidebar, "sidebar", knownRoles);

  let footer: QuickaduiConfigFooter | undefined;
  if (raw.footer !== undefined) {
    if (!isPlainObject(raw.footer)) {
      fail("footer", "expected an object with at least \"enabled\".");
    }
    const enabled = expectBoolean(raw.footer.enabled, "footer.enabled");
    const content = raw.footer.content === undefined ? undefined : expectString(raw.footer.content, "footer.content");
    footer = { enabled, ...(content !== undefined ? { content } : {}) };
  }

  let dashboard: QuickaduiConfigDashboard | undefined;
  if (raw.dashboard !== undefined) {
    if (!isPlainObject(raw.dashboard)) {
      fail("dashboard", "expected an object with at least \"enabled\".");
    }
    const enabled = expectBoolean(raw.dashboard.enabled, "dashboard.enabled");
    const route = raw.dashboard.route === undefined ? undefined : expectString(raw.dashboard.route, "dashboard.route");
    let columns: (typeof DASHBOARD_COLUMNS)[number] | undefined;
    if (raw.dashboard.columns !== undefined) {
      if (!(DASHBOARD_COLUMNS as readonly unknown[]).includes(raw.dashboard.columns)) {
        fail("dashboard.columns", `expected one of ${DASHBOARD_COLUMNS.join(", ")}, got ${JSON.stringify(raw.dashboard.columns)}.`);
      }
      columns = raw.dashboard.columns as (typeof DASHBOARD_COLUMNS)[number];
    }
    let widgets: readonly QuickaduiConfigDashboardWidget[] | undefined;
    if (raw.dashboard.widgets !== undefined) {
      if (!Array.isArray(raw.dashboard.widgets)) {
        fail("dashboard.widgets", `expected an array, got ${JSON.stringify(raw.dashboard.widgets)}.`);
      }
      widgets = raw.dashboard.widgets.map((entry, i) =>
        parseDashboardWidget(entry, `dashboard.widgets[${i}]`, resourceNames),
      );
      // Every widget's `id` becomes a React `key` and a `WidgetGrid`
      // `items` entry (its drag-and-drop identity) in the generated
      // DashboardPage — a duplicate breaks both silently at runtime
      // rather than failing config validation, so it's caught here
      // instead.
      const seenWidgetIds = new Set<string>();
      for (const widget of widgets) {
        if (seenWidgetIds.has(widget.id)) {
          fail("dashboard.widgets", `duplicate widget id ${JSON.stringify(widget.id)} — every widget needs a unique "id".`);
        }
        seenWidgetIds.add(widget.id);
      }
    }
    dashboard = {
      enabled,
      ...(route !== undefined ? { route } : {}),
      ...(columns !== undefined ? { columns } : {}),
      ...(widgets !== undefined ? { widgets } : {}),
    };
  }

  return {
    ...(project !== undefined ? { project } : {}),
    ...(theme !== undefined ? { theme } : {}),
    ...(auth !== undefined ? { auth } : {}),
    resources,
    ...(navbar !== undefined ? { navbar } : {}),
    ...(sidebar !== undefined ? { sidebar } : {}),
    ...(footer !== undefined ? { footer } : {}),
    ...(dashboard !== undefined ? { dashboard } : {}),
  };
}
