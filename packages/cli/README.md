# @quickadui/cli (published as `create-quickadui`)

The `quickadui` command-line tool: `init` scaffolds a new project, `add`
installs QuickadUI packages into one, `generate` writes a working front
end for one resource (list + create/edit) or for login/profile, wired
against a REST API, and `apply` does all of that at once from a single
declarative JSON config file.

> This is a narrower scope than the package's original placeholder
> description (which also mentioned framework detection and Tailwind
> preset wiring). What's below is what's actually implemented — see
> "What's deliberately out of scope" at the bottom.

## `quickadui init [directory] [--force]`

Scaffolds a new Vite + React 19 + TypeScript + Tailwind v4 project at
`directory` (defaults to the current directory), pre-wired so `quickadui
add` works right away:

```sh
npx create-quickadui init my-app
cd my-app
npm install
npm run dev
```

Writes `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`,
`README.md`, `.gitignore`, `src/main.tsx`, `src/App.tsx`,
`src/index.css` (with `@import "tailwindcss";`), and `src/vite-env.d.ts`
(the standard `/// <reference types="vite/client" />` line — without it,
TypeScript/your editor can't resolve side-effect imports like
`import "./index.css"` in `main.tsx`, and errors with "Cannot find
module or type declarations..."). Every dependency version in the
generated `package.json` is pinned to the same major version this
monorepo itself builds and tests against (React 19, Vite 8, TypeScript 7,
Tailwind v4).

Refuses to write into a directory that already exists and isn't empty —
pass `--force` to scaffold into it anyway.

## `quickadui add <package...> [--dir <path>] [--pm npm|pnpm|yarn]`

Adds one or more QuickadUI packages to the `package.json` in the current
directory (or `--dir`), along with:

- every other QuickadUI package they depend on (e.g. `add forms` also
  pulls in `@quickadui/icons`, `@quickadui/primitives`,
  `@quickadui/theme`, `@quickadui/tokens`, and `@quickadui/utils`), and
- their real external dependencies (React Hook Form, Zod, Motion, Radix,
  Lucide, `class-variance-authority`, `clsx`, `tailwind-merge`, etc.), at
  the version ranges each package actually declares.

```sh
quickadui add core
quickadui add forms data --pm pnpm
```

`add` only ever edits `package.json` — it deliberately does not touch
`src/index.css`. For any installed package that ships its own hardcoded
Tailwind classes (most of them do), it instead prints the exact
`@source "../node_modules/<package>";` line(s) to add by hand, e.g.:

```
Added @quickadui/icons, @quickadui/primitives, @quickadui/tokens, @quickadui/theme, @quickadui/utils, @quickadui/forms to package.json.

Next steps:
  1. Run `pnpm install` to fetch the new dependencies.
  2. Add the following line(s) to your CSS entry point (after your `@import "tailwindcss";`):

     @import "@quickadui/theme/tokens.css";
     @import "@quickadui/theme/tailwind-theme.css";
     @source "../node_modules/@quickadui/primitives";
     @source "../node_modules/@quickadui/forms";

     Without the @quickadui/theme lines, semantic color classes (bg-accent-9,
     border-neutral-6, ...) generate no CSS at all — components render with no color.

     Without the @source line(s), Tailwind won't see these packages' own classes
     once installed into node_modules, and their components will render unstyled.

     These paths assume your CSS entry point is `src/index.css` (the `quickadui init`
     default) — Tailwind resolves `@source` relative to the stylesheet it's written in,
     not your project root, so adjust the `../` prefix if yours lives somewhere else.

     @quickadui/theme's own stylesheets only recolor components that carry their own
     `bg-neutral-*`/`text-neutral-*` classes (Navbar, Sidebar, ...) — your page's plain
     `<body>` background stays whatever the browser default is otherwise. Add this too:

     @layer base {
       body {
         @apply bg-neutral-1 text-neutral-12;
       }
     }
```

**Why `../` and not `./`:** Tailwind v4 resolves `@source` relative to the
*stylesheet it's written in*, not the project root. `quickadui init`
scaffolds the CSS entry point at `src/index.css`, one directory below the
project root where `node_modules` actually lives — so from that file,
`node_modules` is `../node_modules`. Getting this wrong doesn't error:
Tailwind silently finds nothing under the nonexistent
`src/node_modules/<package>`, and every class that package ships goes
missing from the generated CSS — so every component from it renders
completely unstyled with nothing pointing at the cause. (This was a real
bug in earlier versions of this printed guidance, caught by testing
`generate app`'s output against a real, separately-installed project.)

**Also worth adding when `@quickadui/theme` is installed:** none of its
components apply a background/text color to the page itself — only to
themselves. A plain `<body>` with no `bg-neutral-*` class stays the
browser's default white forever, regardless of light/dark mode, even
though every `@quickadui/shell` component around it (which does carry its
own `bg-neutral-1`) switches correctly. The `@layer base { body { ... } }`
snippet above closes that gap.

Rewriting an unfamiliar CSS file automatically risks corrupting whatever
the person already has there — printing the exact line is the safer
trade-off.

`add` fails clearly (non-zero exit, no partial edit) when: no package
name is given, an unknown package name is given, or there's no
`package.json` at the target directory yet (run `init` first).

### Version note

All `@quickadui/*` packages are published on npm as of 2026-09-17, at
version `0.1.0` (verified against the registry, not assumed). `add`
records that as `^0.1.0` in `src/packages.ts`. This means a project
scaffolded with `quickadui init` and then `quickadui add ...` installs
cleanly with a plain `npm install` (or pnpm/yarn) from **anywhere** —
another machine, a teammate's laptop — with no dependency on this
monorepo. Update the registry in `src/packages.ts` again whenever a new
release ships.

## `quickadui generate resource <TypeName> --fields "name:type,..." [--endpoint <path>] [--api-base <url>] [--dir <path>]`

Generates a working front end for one resource: a typed API client
(`src/api/<name>.api.ts`), a Zod schema (`src/schemas/<name>.schema.ts`),
a list page with pagination and delete (`src/pages/<name>/<Type>ListPage.tsx`),
and a create/edit form page (`src/pages/<name>/<Type>FormPage.tsx`).
**Front end only** — it doesn't generate or assume any particular
back end; the API client just calls whatever REST-shaped URL you point
it at with `--api-base` (GET list, GET by id, POST `.../add`, PUT
`.../:id`, DELETE `.../:id`).

```sh
quickadui add core data forms   # prerequisite — see below
quickadui generate resource Product --fields "title:string,category:string,price:number,stock:number"
```

- `--fields` is required: a comma-separated `name:type` list. Supported
  types are `string`, `number`, and `boolean`.
- `--endpoint` is the URL path segment (defaults to a naive plural of
  `TypeName`, e.g. `Product` → `products` — pass it explicitly for an
  irregular plural or a different path).
- `--api-base` defaults to the free, keyless
  [DummyJSON](https://dummyjson.com) demo API, so the very first run
  works with zero setup. DummyJSON's write endpoints (add/update/delete)
  respond successfully but don't persist anything server-side — expected
  behavior for a demo API, called out again in the generated files'
  own header comments. Point `--api-base` at a real backend once you
  have one; nothing else needs to change since every generated function
  already matches a plain REST shape.

Fails clearly (before writing anything) if `@quickadui/core`,
`@quickadui/data`, or `@quickadui/forms` haven't been added to the
project yet — the generated code imports from all three.

Doesn't assume a router: the generated pages are plain components with
links like `#/products/new`; wire them into whatever routing (or lack of
one) your app already has.

## `quickadui generate auth [--api-base <url>] [--dir <path>]`

Generates an auth client (`src/auth/auth-client.ts`), an
`AuthProvider`/`useAuth()` (`src/auth/AuthProvider.tsx`), a login page
(`src/pages/LoginPage.tsx`), and a profile page
(`src/pages/ProfilePage.tsx`) — login, "who am I", and logout, with the
access token kept in `localStorage`.

```sh
quickadui add core forms   # prerequisite
quickadui generate auth
```

**No sign-up page is generated.** Against the default DummyJSON demo
API, `/users/add` *looks* like account creation but — like its other
write endpoints — doesn't persist a real account server-side, so a
generated sign-up form there would create something that only works for
one request. Try the demo account instead: username `emilys`, password
`emilyspass` (any user at <https://dummyjson.com/users> works). Point
`--api-base` at a real backend with real sign-up once you have one.

## `quickadui generate app [--navbar|--no-navbar] [--sidebar|--no-sidebar] [--footer|--no-footer] [--navbar-items "Label:href,..."] [--sidebar-items "Label:href,..."] [--yes] [--force] [--dir <path>]`

Generates `src/App.tsx`: a light/dark/system theme toggle (via
`@quickadui/theme`'s `useTheme()`) plus a hash-based router wired to
every page `generate resource`/`generate auth` already produced in the
project — run it any time after either of those, or interleaved with
them, in any order.

```sh
quickadui add core theme shell   # prerequisite — shell only needed for navbar/sidebar/footer
quickadui generate resource Product --fields "title:string,price:number"
quickadui generate auth
quickadui generate app
```

Unless every relevant flag is passed (or `--yes`), it asks three
questions interactively — **the one command in this CLI that does**, see
below:

```
Add a Navbar? [Y/n]
Navbar items (Label:href,...) [Products:#/products,Login:#/login,Profile:#/profile]
Add a Sidebar? [y/N]
Add a Footer? [Y/n]
```

The navbar/sidebar item list is pre-filled from whatever pages it found
— accept it as-is or type your own `Label:href,Label2:href2` list. Pass
`--navbar-items`/`--sidebar-items` (or `--navbar`/`--no-navbar` etc.) on
the command line to skip the matching question; `--yes` skips every
remaining one, falling back to navbar+footer on, sidebar off, with the
auto-detected items.

Each item can optionally carry a third `:`-separated segment naming an
icon — `Label:href:Icon`, e.g. `Products:#/products:Settings` — one of
`@quickadui/icons`' exported names, without the `Icon` suffix. When set,
the generated navbar renders it next to the label inside the link, and
the generated sidebar passes it as `SidebarNavItem`'s own `icon` prop.
Omit it (`Label:href`, no trailing colon) for no icon, same as before
this existed. Not verified against the real package's export list here —
a typo shows up as a broken import in the generated project, not as a
CLI error.

Requires `@quickadui/core` and `@quickadui/theme` always, plus
`@quickadui/shell` if any of Navbar/Sidebar/Footer is included (that's
where they live). Refuses to overwrite an existing `src/App.tsx` without
`--force`.

**The generated file only handles half of what makes the theme toggle
(and every component's color) actually visible** — the other half is a
two-line CSS `@import` that `generate app` reminds you about in its
"next steps" output (the same two lines `quickadui add theme` prints):

```css
@import "@quickadui/theme/tokens.css";
@import "@quickadui/theme/tailwind-theme.css";
```

Without them, the toggle still cycles state, but nothing on screen
changes — components render with no color at all, since the semantic
classes they use (`bg-accent-9`, `border-neutral-6`, ...) generate no
CSS until theme's stylesheets are imported.

Doesn't assume a router here either, same as `generate resource`/`auth`
— routing is a plain `window.location.hash` switch; swap in React
Router/TanStack Router/etc. whenever you outgrow it.

## `quickadui apply <config.json> [--dir <path>] [--pm npm|pnpm|yarn] [--force]`

A declarative alternative to running `add`/`generate resource`/`generate
auth`/`generate app` by hand, one at a time: describe the whole app in a
single JSON file and generate it in one command. `quickadui init` must
already have been run in the target directory — `apply` adds packages and
generates files into it, it doesn't scaffold the project itself.

```sh
quickadui init my-shop && cd my-shop
quickadui apply ./quickadui.config.json
```

A minimal config — one resource, everything else left at its defaults:

```json
{
  "resources": [
    {
      "name": "product",
      "fields": [
        { "name": "title", "type": "string" },
        { "name": "price", "type": "number" },
        { "name": "inStock", "type": "boolean" }
      ]
    }
  ]
}
```

**Omitting a section isn't the same as turning it off.** `navbar` and
`footer` both default to *enabled* when left out of the config entirely
— matching `generate app`'s own defaults — while `sidebar` defaults to
*disabled*. So the minimal config above still generates a Navbar (with
one auto-derived item per resource/auth page) and a Footer, with no
Sidebar. To actually turn one off, set it explicitly:

```json
{ "navbar": { "enabled": false }, "footer": { "enabled": false } }
```

And to configure a section instead of just defaulting it, give it its
own object with `"enabled": true` and whatever else it takes (`items`,
`brand`, `content`, …) — see the full schema just below.

The full schema (`project`, `theme`, `auth` with `roles`/`roleField`,
`resources` with per-view `fields`/`actions`, `navbar`/`sidebar` with
role-gated `items`, `footer`, `dashboard` with stat/list `widgets`) is
documented directly on the TypeScript types and the validator in
`src/quickadui-config.ts` — every field has a doc comment there, and every
rejection names the exact bad path (e.g. `resources[0].views.list.fields`
referencing a field the resource never declared, or an action's `role`
that isn't in `auth.roles`).

`apply` validates the whole file before writing anything, then runs, in
order: `add` (every QuickadUI package the config's contents will need),
`generate resource` for each entry in `resources`, `generate auth` if
`auth.enabled`, and finally `generate app` — non-interactively; the
config file replaces the prompts `generate app` would otherwise ask, it
doesn't answer them one by one.

**Not every section of the schema is wired into code generation yet.**
The schema is intentionally ahead of the generators, so a config file
written today keeps validating (and keeps documenting intent) as they
catch up. Right now, `resources[].views` (per-view field lists and the
detailed `actions` objects — icon, `role`, `requiresAuth`, automatic
`isLoading`), `footer.content`, and `role`/`requiresAuth` gating on nav
items are all validated but not yet reflected in generated code — every
view still gets the resource's full flat field list, and nav items are
visible to everyone. `apply`'s output lists exactly which of these your
config touched, every time, so this is never a silent gap.

One exception, already wired end to end: a navbar/sidebar item's `icon`
(one of `@quickadui/icons`' exported names, without the `Icon` suffix —
same convention as `resources[].views[].actions[].icon`) *is* reflected
in the generated `src/App.tsx`, imported from `@quickadui/icons` and
rendered next to the item's label:

```json
{
  "resources": [{ "name": "product", "fields": [{ "name": "title", "type": "string" }] }],
  "navbar": {
    "enabled": true,
    "items": [{ "label": "Products", "href": "#/products", "icon": "Settings" }]
  }
}
```

Another exception, also wired end to end: a resource's `buttonIcons` puts
an icon on that resource's own generated New/Edit/Delete/Save/Cancel
buttons — a small, fixed 5-slot mapping, distinct from the much larger
(and not yet generated) `resources[].views[].actions[].icon` system
mentioned above. Each slot takes one of `@quickadui/icons`' exported
names, without the `Icon` suffix, and any slot can be left out to keep
that one button text-only:

```json
{
  "resources": [
    {
      "name": "product",
      "fields": [{ "name": "title", "type": "string" }, { "name": "price", "type": "number" }],
      "buttonIcons": { "create": "Plus", "delete": "Trash", "save": "Check", "cancel": "Close" }
    }
  ]
}
```

`create` and `cancel` render inside the button's own `<a>` link (New and
Cancel are `asChild` buttons wrapping a link, so the icon has to be a
plain JSX child there — `Button`'s own `icon` prop is a no-op on an
`asChild` button); `delete` and `save` go through `Button`'s `icon` prop
directly, since those two are real `<button>` elements. `edit` follows
the same `<a>` pattern as `create`/`cancel`, but note that
`@quickadui/icons` doesn't currently export a pencil/edit icon — pick
whatever existing icon fits your app, or leave `edit` out.

Each slot can also be an object instead of a plain string, to drop the
button's visible text entirely and render icon-only —
`{ "icon": "Trash", "showLabel": false }`. An icon-only button renders
via `@quickadui/core`'s `IconButton` instead of `Button`, with the
button's usual text moved to `aria-label` so it stays accessible with
no visible label:

```json
{
  "buttonIcons": {
    "create": "Plus",
    "edit": { "icon": "Settings", "showLabel": false },
    "delete": { "icon": "Trash", "showLabel": false },
    "save": "Check",
    "cancel": { "icon": "Close", "showLabel": false }
  }
}
```

`showLabel` defaults to `true` — a plain string (`"Plus"`) is shorthand
for `{ "icon": "Plus", "showLabel": true }` and keeps today's icon +
visible text behavior exactly. Mixing both forms on the same resource,
like the example above, is fine — each of the five slots is independent.

One real, documented gap: `IconButton` has no `"destructive"` variant
(only `solid`/`soft`/`outline`/`ghost`), unlike `Button`. An icon-only
Delete button falls back to `variant="ghost"` plus a danger-colored
`className` to keep the same visual intent, rather than a true
destructive-styled icon button.

Another exception, wired end to end: a resource's `endpoints` overrides
the URL path and/or HTTP method `generate resource`/`apply` use for one
or more of that resource's five requests (`list`/`get`/`create`/
`update`/`delete`), and — for `list` only — the shape of the response
they expect back. Omit `endpoints` entirely (today's default) and every
request follows the free DummyJSON demo API's own conventions: a plain
GET against `<endpoint>`/`<endpoint>/{id}`, a POST to `<endpoint>/add`
(DummyJSON's own convention — **not** standard REST), PUT/DELETE against
`<endpoint>/{id}`, and a list response wrapped as
`{ total, skip, limit, "<endpoint>": [...] }` that drives real
server-side pagination (`?limit=&skip=`).

Most real backends don't work that way — `POST` goes straight to the
plain endpoint, and `GET <endpoint>` returns a bare array with no
wrapper or built-in pagination. Point at one of those without
hand-editing the generated `src/api/*.api.ts` afterward:

```json
{
  "resources": [
    {
      "name": "book",
      "endpoint": "books",
      "fields": [{ "name": "title", "type": "string" }],
      "endpoints": {
        "list": { "responseShape": "array" },
        "create": { "path": "books" }
      }
    }
  ]
}
```

`list`/`get`/`create`/`update`/`delete` are all independently optional —
set only the ones that differ from the defaults above. Each takes:

- `path` — the URL path relative to `apiBase`, replacing the default
  built from `endpoint`. For `get`/`update`/`delete` it must contain a
  literal `"{id}"` placeholder somewhere in the string (e.g.
  `"books/{id}"` or `"books/{id}/details"`) — rejected at parse time
  otherwise, since those three requests need somewhere to put the id.
  `list`/`create` take a plain path, no placeholder.
- `method` — one of `"GET"`/`"POST"`/`"PUT"`/`"PATCH"`/`"DELETE"`,
  replacing that action's own natural default.
- `responseShape` (`list` only) — `"wrapped"` (default, DummyJSON's own
  shape, described above) or `"array"`, when the response *is* the array
  of items with no wrapper. `"array"` has no server-side total/skip/limit
  to read, so the generated list page fetches the full list once and
  paginates it client-side instead of asking the server for one page at
  a time.

This only covers the five requests `generate resource` already
generates — a custom, non-CRUD action (a `PATCH /books/{id}/read`
"mark as read" toggle, say) isn't something `endpoints` maps to; add
that by hand to the generated `src/api/*.api.ts` and wire your own UI
for it, same as before this feature existed.

Another exception, wired end to end: `theme.default` and `theme.colors`
control `<ThemeProvider>`'s own `defaultTheme`/`defaultColors` props in
the generated `src/App.tsx`. `theme.default` (`"light"`/`"dark"`/
`"system"`) only matters on a visitor's very first visit — before
anything is stored, it's what `useTheme()` starts from; every later
visit uses whatever the person last chose (or their OS preference, for
`"system"`), regardless of this setting, exactly like leaving it unset
does today. `theme.colors` overrides one or more of the five seed color
families (`accent`, `neutral`, `success`, `warning`, `danger`) — each a
`"#RRGGBB"` hex string — and is why every generated app defaults to the
same orange accent (`@quickadui/tokens`' build-time `accent` seed) unless
you set it here:

```json
{
  "theme": {
    "default": "dark",
    "colors": { "accent": "#2563EB" }
  }
}
```

Light/dark mode itself (the toggle, and which CSS variables each mode
resolves to) isn't affected by this at all — that's `@quickadui/theme`'s
own job and already works regardless of `theme.colors`. Omit `theme`
entirely for today's original default: no `defaultTheme`/`defaultColors`
props at all, `ThemeProvider`'s own built-in default (`"system"`) and
`@quickadui/tokens`' built-time orange accent apply, byte-identical to
before this existed.

Another exception, wired end to end: a resource's `toasts` shows a
[`@quickadui/overlays`](https://www.npmjs.com/package/@quickadui/overlays)
Toast after that resource's own create/update/delete actions succeed or
fail. Setting `toasts` at all — even `{}`, or with just one key set —
mounts `<Toaster />` once in the generated `src/App.tsx` (so `apply`
adds `@quickadui/overlays` to the project automatically) and wires a
`toast({ ... })` call into every one of the six outcomes; any key left
out falls back to a sensible generated default message (e.g. "Product
created.", "Failed to delete product.") rather than being silently
skipped:

```json
{
  "resources": [
    {
      "name": "product",
      "fields": [{ "name": "title", "type": "string" }],
      "toasts": {
        "createSuccess": "Product added.",
        "createError": "Couldn't add the product.",
        "updateSuccess": "Changes saved.",
        "updateError": "Couldn't save your changes.",
        "deleteSuccess": "Product removed.",
        "deleteError": "Couldn't remove the product."
      }
    }
  ]
}
```

Omit `toasts` entirely for today's original default: no toast calls at
all, no `@quickadui/overlays` import, generated code byte-identical to
before this existed.

Another exception, wired end to end: a resource's `confirmDelete` swaps
its list page's Delete button from firing immediately to opening a
styled confirmation dialog first — a `@quickadui/overlays` `Modal`,
rendered once at the bottom of the page, not a native browser
`confirm()` popup. `true` uses a generated default message ("Delete this
`<resource>`? This can't be undone."); a string replaces it with your own
wording. Either form pulls in `@quickadui/overlays` the same way
`toasts` does (only once, even when a resource sets both):

```json
{
  "resources": [
    {
      "name": "product",
      "fields": [{ "name": "title", "type": "string" }],
      "confirmDelete": "Delete this product? This can't be undone."
    }
  ]
}
```

Omit `confirmDelete` (or set it to `false`) for today's original
default: Delete fires immediately, no dialog, no Modal import.

Another exception, wired end to end: `navbar.brand`/`sidebar.brand` set
the text shown in the navbar's/sidebar's brand slot (`NavbarBrand`/
`SidebarHeader`), and `navbar.logo`/`sidebar.logo` show an image there
instead — a path (e.g. `"/logo.svg"` for a file in your project's
`public/` folder) or a full `https://` URL. `brand`'s text becomes that
image's `alt`, so accessibility keeps working either way. `navbar` and
`sidebar` are independent — set `brand`/`logo` on one, both, or neither:

```json
{
  "navbar": { "enabled": true, "logo": "/logo.svg" },
  "sidebar": { "enabled": true, "brand": "My Shop" }
}
```

Omit both `brand` and `logo` (on either) for today's original default:
the target project's own `package.json` "name", as plain text. This CLI
never copies or generates the image file itself — make sure whatever
`logo` points at actually resolves at runtime (e.g. drop `logo.svg` into
your Vite project's `public/` folder yourself before pointing `logo` at
it).

Another exception, wired end to end: whenever `auth.enabled` generates
an `<AuthProvider>`, `src/App.tsx` also wraps its content in an
`AuthGate` that shows a centered, animated `Spinner` (from
`@quickadui/core`) in place of the app while `AuthProvider` runs its
initial "am I already signed in" check (`useAuth().loading`) — instead
of a flash of logged-out content on every page load/refresh. No config
needed: it's on automatically whenever auth is, and there's nothing to
turn it off, since a login-page flash was never something worth keeping
as an option.

### `dashboard` — generating a `DashboardPage`

Set `dashboard.enabled: true` to generate `src/pages/DashboardPage.tsx`
and wire a router case for it into `src/App.tsx` (at `dashboard.route`,
default `"#/"`). Each entry in `dashboard.widgets` becomes one tile on
the page, built from `@quickadui/shell`'s `Widget`/`WidgetGrid` and, for
`type: "stat"`, `@quickadui/charts`' `StatCard`:

```json
{
  "resources": [
    { "name": "product", "fields": [{ "name": "title", "type": "string" }, { "name": "price", "type": "number" }] },
    { "name": "todo", "fields": [{ "name": "todo", "type": "string" }, { "name": "completed", "type": "boolean" }] }
  ],
  "dashboard": {
    "enabled": true,
    "route": "#/",
    "columns": 3,
    "widgets": [
      { "id": "product-count", "type": "stat", "title": "Products", "resource": "product", "icon": "Settings" },
      { "id": "recent-todos", "type": "list", "title": "Recent todos", "resource": "todo", "limit": 5 }
    ]
  }
}
```

- `type: "stat"` renders a `StatCard` showing a single number: how many
  records the resource has. `type: "list"` renders the first `limit`
  (default `5`) records, one line each, using the resource's first
  declared field as the label.
- `resource` must match a `resources[].name` you've already declared.
  `icon` is optional (one of `@quickadui/icons`' exported names, without
  the `Icon` suffix); `metric` currently only accepts `"count"` (also the
  default) and exists so a second metric can be added later without a
  breaking config change.
- **No separate "dashboard API" is generated, and none is needed.** Both
  widget types are read from the same list endpoint `generate resource`
  already generates for that resource (`GET /<endpoint>?limit=...`) — a
  `stat` widget calls it with `limit: 1` and reads the response's own
  `total` field (a REST list endpoint's pagination total is already
  computed server-side, which is what "an API responsible for the
  computation" means here for a plain REST backend); a `list` widget
  calls it with `limit: <limit>` and previews the rows it gets back. If
  you later want a metric no list endpoint can answer (an average, a
  sum, a custom aggregate), that needs a real backend endpoint for it —
  out of scope for this CLI, which never generates back-end code.
- **Widgets can be dragged to reorder**, using `@quickadui/shell`'s own
  drag-and-drop `WidgetGrid` (pointer and keyboard, via `onReorder` — see
  `widget-grid.tsx`'s own docs). The dragged order is remembered per
  browser via `localStorage` (best-effort: a private window or blocked
  storage just falls back to `dashboard.widgets`' own order, same as a
  first visit) — no backend/API involved, same "reuse what's already
  there" approach the widgets' own data-fetching already takes. Adding or
  removing widgets in the config and re-running `apply` is still how you
  change *which* widgets exist; dragging only changes their order.
- Requires `@quickadui/shell` (for `Widget`/`WidgetGrid`) whenever
  `dashboard.widgets` is non-empty, and additionally `@quickadui/charts`
  (for `StatCard`) whenever at least one widget is `type: "stat"` — both
  are added automatically by `apply`, same as every other required
  package.
- `dashboard.enabled: true` with an empty (or omitted) `widgets` array
  still generates `DashboardPage.tsx` and wires the route — it just
  renders a placeholder message instead of any widgets, so the route
  exists before you've decided what goes on it.
- **When `navbar`/`sidebar` are left at their default (no explicit
  `items` array), a "Dashboard" link pointing at `dashboard.route` is
  added automatically, first in the list** — the same auto-detection
  navbar/sidebar already give every generated resource/auth page, so
  enabling `dashboard` alone is enough to get a working, visible link to
  it. Give `navbar`/`sidebar` your own `items` array (as this README's
  earlier examples do) and that list is used exactly as written instead
  — nothing is silently added to it, so add your own `{ "label":
  "Dashboard", "href": "#/", ... }` entry if you want the link there too.

## What's deliberately out of scope

- **No framework detection.** `init` only ever scaffolds the one
  Vite + React + Tailwind template. Detecting/supporting Next.js, Remix,
  etc. is future work, not implemented here.
- **No interactive prompts, except one.** `init`, `add`, `generate
  resource`, and `generate auth` are fully argv-driven — no
  `inquirer`-style Y/N/select prompts. `generate app` is the deliberate
  exception: composing an app shell has enough small yes/no decisions
  (Navbar? Sidebar? Footer? which items?) that forcing them all onto
  flags makes the common case more typing than just answering three
  questions — pass every relevant flag (or `--yes`) to skip them and
  keep it scriptable. This is still the CLI's only stdin/stdout code
  path; everything else stays fully argv-driven and dependency-free.
- **No automatic CSS rewriting**, as explained above under `add`.
- **`generate` never writes a back end.** It only ever generates the
  front-end side (API client + pages) of a resource or of auth, pointed
  at whatever `--api-base` you give it. Generating a matching back end
  (routes, a database, real auth) is a possible later addition, not
  implemented here.
- **No generated sign-up page**, as explained above under `generate auth`.

## Architecture

Every piece of actual logic — the package registry and its dependency
resolution (`packages.ts`), merging conflicting external dependency
ranges (`merge-external-dependencies.ts`), editing a `package.json`
object (`package-json.ts`), rendering the `@source` line
(`source-directive.ts`), rendering the "next steps" summary
(`render-add-next-steps.ts`), argv parsing (`args.ts`), and the scaffold
file templates (`templates.ts`) — is written as pure functions with real
unit tests. `commands/init.ts` and `commands/add.ts` are the only files
that touch the filesystem, and `index.ts` is a thin argv → command
dispatcher.

`generate` follows the same split, under `src/generate/`:
`field-spec.ts` parses `--fields`, `case.ts` has the string-case helpers,
`resource-templates.ts`/`auth-templates.ts`/`app-shell-templates.ts`/
`dashboard-templates.ts` are the pure template builders (mirroring
`templates.ts`), `check-prerequisites.ts` reads the target project's
`package.json` to fail fast if a required package is missing,
`write-files.ts` is the shared filesystem-writing loop, and
`render-generate-next-steps.ts` renders the "next steps" summary for all
`generate` subcommands. `discover-features.ts` scans a project's
already-generated pages (read-only, but not pure — same category as
`check-prerequisites.ts`) and `nav-items.ts` is the pure
"Label:href,..." parser/formatter/default builder that `generate app`
and its prompts share. `prompts.ts` is the CLI's one stdin/stdout
boundary — a thin wrapper over Node's built-in `readline/promises`,
deliberately untested directly (see `generate app` above for why it
exists at all). `commands/generate-resource.ts`,
`commands/generate-auth.ts`, `commands/generate-app.ts`, and
`commands/generate-dashboard.ts` are the only files in there that touch
the filesystem or stdin/stdout. `commands/apply.ts` is the only place
that orchestrates all of the above from a single parsed
`QuickaduiConfig` (`quickadui-config.ts`).
