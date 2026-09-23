import { describe, expect, it } from "vitest";
import { parseQuickaduiConfig } from "./quickadui-config";

function minimalValidConfig() {
  return {
    resources: [
      {
        name: "product",
        fields: [
          { name: "title", type: "string" },
          { name: "price", type: "number" },
        ],
      },
    ],
  };
}

describe("parseQuickaduiConfig — valid configs", () => {
  it("parses the minimal valid config: just a non-empty resources array", () => {
    const config = parseQuickaduiConfig(minimalValidConfig());
    expect(config.resources).toHaveLength(1);
    expect(config.resources[0]).toMatchObject({ name: "product" });
  });

  it("parses a full config exercising every top-level section", () => {
    const raw = {
      project: { name: "My Shop", apiBase: "https://dummyjson.com" },
      theme: { default: "dark" },
      auth: {
        enabled: true,
        apiBase: "https://dummyjson.com",
        roles: ["admin", "user"],
        roleField: "role",
      },
      resources: [
        {
          name: "product",
          endpoint: "products",
          apiBase: "https://dummyjson.com",
          fields: [
            { name: "title", type: "string", label: "Title" },
            { name: "price", type: "number" },
            { name: "inStock", type: "boolean" },
          ],
          views: {
            list: {
              fields: ["title", "price"],
              actions: [
                { label: "Delete", kind: "delete", role: ["admin"], confirm: true },
                { label: "View", kind: "navigate", to: "update" },
              ],
            },
            create: {
              fields: ["title", "price", "inStock"],
              actions: [{ label: "Save", kind: "submit", requiresAuth: true }],
              requiresAuth: true,
            },
            update: {
              fields: ["title", "price"],
            },
          },
        },
      ],
      navbar: {
        enabled: true,
        brand: "My Shop",
        logo: "/logo.svg",
        items: [
          { label: "Products", href: "#/products" },
          { label: "Admin", href: "#/admin", role: ["admin"], requiresAuth: true },
        ],
      },
      sidebar: { enabled: false },
      footer: { enabled: true, content: "© 2026 My Shop" },
      dashboard: {
        enabled: true,
        route: "#/dashboard",
        columns: 2,
        widgets: [
          {
            id: "product-count",
            type: "stat",
            title: "Products",
            resource: "product",
            metric: "count",
            icon: "Package",
          },
          {
            id: "recent-products",
            type: "list",
            title: "Recent products",
            resource: "product",
            limit: 5,
          },
        ],
      },
    };

    const config = parseQuickaduiConfig(raw);

    expect(config.project).toEqual({ name: "My Shop", apiBase: "https://dummyjson.com" });
    expect(config.theme).toEqual({ default: "dark" });
    expect(config.auth).toEqual({
      enabled: true,
      apiBase: "https://dummyjson.com",
      roles: ["admin", "user"],
      roleField: "role",
    });
    expect(config.resources).toHaveLength(1);
    expect(config.resources[0]?.views?.list?.fields).toEqual(["title", "price"]);
    expect(config.resources[0]?.views?.list?.actions).toHaveLength(2);
    expect(config.navbar?.items).toHaveLength(2);
    expect(config.navbar?.logo).toBe("/logo.svg");
    expect(config.sidebar).toEqual({ enabled: false });
    expect(config.footer).toEqual({ enabled: true, content: "© 2026 My Shop" });
    expect(config.dashboard?.widgets).toHaveLength(2);
  });

  it("defaults an optional field's label by simply omitting it (no forced default value)", () => {
    const config = parseQuickaduiConfig(minimalValidConfig());
    expect(config.resources[0]?.fields[0]).toEqual({ name: "title", type: "string" });
  });

  it("accepts a role used consistently across auth.roles, an action, and a nav item", () => {
    const raw = {
      auth: { enabled: true, roles: ["admin"] },
      resources: [
        {
          name: "product",
          fields: [{ name: "title", type: "string" }],
          views: {
            list: {
              fields: ["title"],
              actions: [{ label: "Delete", kind: "delete", role: ["admin"] }],
            },
          },
        },
      ],
      navbar: { enabled: true, items: [{ label: "Admin", href: "#/admin", role: ["admin"] }] },
    };
    expect(() => parseQuickaduiConfig(raw)).not.toThrow();
  });

  it("parses a nav item's icon", () => {
    const raw = {
      ...minimalValidConfig(),
      navbar: { enabled: true, items: [{ label: "Home", href: "#/", icon: "Home" }] },
    };
    const config = parseQuickaduiConfig(raw);
    expect(config.navbar?.items?.[0]).toEqual({ label: "Home", href: "#/", icon: "Home" });
  });

  it("allows multiple resources with distinct names", () => {
    const raw = {
      resources: [
        { name: "product", fields: [{ name: "title", type: "string" }] },
        { name: "category", fields: [{ name: "name", type: "string" }] },
      ],
    };
    const config = parseQuickaduiConfig(raw);
    expect(config.resources).toHaveLength(2);
  });
});

describe("parseQuickaduiConfig — top-level structure errors", () => {
  it("throws when the top-level value isn't an object", () => {
    expect(() => parseQuickaduiConfig("not an object")).toThrow(/expected a JSON object/);
    expect(() => parseQuickaduiConfig(null)).toThrow(/expected a JSON object/);
    expect(() => parseQuickaduiConfig([1, 2, 3])).toThrow(/expected a JSON object/);
  });

  it('throws when "resources" is missing', () => {
    expect(() => parseQuickaduiConfig({})).toThrow(/"resources"/);
  });

  it('throws when "resources" isn\'t an array', () => {
    expect(() => parseQuickaduiConfig({ resources: "product" })).toThrow(/"resources"/);
  });

  it("allows an empty resources array to pass this check (resource-level emptiness is a separate concern)", () => {
    // An empty top-level array is structurally valid here; it's each
    // individual resource's own "fields" that must be non-empty.
    expect(() => parseQuickaduiConfig({ resources: [] })).not.toThrow();
  });

  it("throws on a duplicate resource name", () => {
    const raw = {
      resources: [
        { name: "product", fields: [{ name: "title", type: "string" }] },
        { name: "product", fields: [{ name: "name", type: "string" }] },
      ],
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/duplicate resource name "product"/);
  });
});

describe("parseQuickaduiConfig — resource/field errors", () => {
  it("throws when a resource isn't an object", () => {
    expect(() => parseQuickaduiConfig({ resources: ["product"] })).toThrow(/resources\[0\]/);
  });

  it("throws when a resource has no name", () => {
    const raw = { resources: [{ fields: [{ name: "title", type: "string" }] }] };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/resources\[0\]\.name/);
  });

  it("throws when a resource's fields array is missing", () => {
    const raw = { resources: [{ name: "product" }] };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/resources\[0\]\.fields/);
  });

  it("throws when a resource's fields array is empty", () => {
    const raw = { resources: [{ name: "product", fields: [] }] };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/resources\[0\]\.fields/);
  });

  it("throws on a duplicate field name within a resource", () => {
    const raw = {
      resources: [
        {
          name: "product",
          fields: [
            { name: "title", type: "string" },
            { name: "title", type: "number" },
          ],
        },
      ],
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/duplicate field name "title"/);
  });

  it("throws on an unknown field type", () => {
    const raw = { resources: [{ name: "product", fields: [{ name: "title", type: "date" }] }] };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/resources\[0\]\.fields\[0\]\.type/);
  });

  it("throws on a field with a missing name", () => {
    const raw = { resources: [{ name: "product", fields: [{ type: "string" }] }] };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/resources\[0\]\.fields\[0\]\.name/);
  });
});

describe("parseQuickaduiConfig — resource buttonIcons", () => {
  it("parses a resource's buttonIcons, all five slots independently optional", () => {
    const raw = {
      resources: [
        {
          name: "product",
          fields: [{ name: "title", type: "string" }],
          buttonIcons: { create: "Plus", delete: "Trash", save: "Check" },
        },
      ],
    };
    const config = parseQuickaduiConfig(raw);
    expect(config.resources[0]?.buttonIcons).toEqual({
      create: "Plus",
      delete: "Trash",
      save: "Check",
    });
  });

  it("omits buttonIcons entirely when the config doesn't set it — today's default, every button stays text-only", () => {
    const config = parseQuickaduiConfig(minimalValidConfig());
    expect(config.resources[0]?.buttonIcons).toBeUndefined();
  });

  it("throws when buttonIcons isn't an object", () => {
    const raw = {
      resources: [
        { name: "product", fields: [{ name: "title", type: "string" }], buttonIcons: "Plus" },
      ],
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/resources\[0\]\.buttonIcons/);
  });

  it("throws when one buttonIcons slot isn't a string or an object", () => {
    const raw = {
      resources: [
        { name: "product", fields: [{ name: "title", type: "string" }], buttonIcons: { edit: 42 } },
      ],
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/resources\[0\]\.buttonIcons\.edit/);
  });

  it("parses a buttonIcons slot as an object with showLabel: false, for an icon-only button", () => {
    const raw = {
      resources: [
        {
          name: "product",
          fields: [{ name: "title", type: "string" }],
          buttonIcons: { delete: { icon: "Trash", showLabel: false } },
        },
      ],
    };
    const config = parseQuickaduiConfig(raw);
    expect(config.resources[0]?.buttonIcons).toEqual({
      delete: { icon: "Trash", showLabel: false },
    });
  });

  it("parses a buttonIcons slot as an object without showLabel — same as a plain string, icon + visible text", () => {
    const raw = {
      resources: [
        {
          name: "product",
          fields: [{ name: "title", type: "string" }],
          buttonIcons: { save: { icon: "Check" } },
        },
      ],
    };
    const config = parseQuickaduiConfig(raw);
    expect(config.resources[0]?.buttonIcons).toEqual({ save: { icon: "Check" } });
  });

  it('throws when a buttonIcons slot object is missing its "icon" key', () => {
    const raw = {
      resources: [
        {
          name: "product",
          fields: [{ name: "title", type: "string" }],
          buttonIcons: { delete: { showLabel: false } },
        },
      ],
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/resources\[0\]\.buttonIcons\.delete\.icon/);
  });

  it("throws when a buttonIcons slot object's showLabel isn't a boolean", () => {
    const raw = {
      resources: [
        {
          name: "product",
          fields: [{ name: "title", type: "string" }],
          buttonIcons: { delete: { icon: "Trash", showLabel: "false" } },
        },
      ],
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(
      /resources\[0\]\.buttonIcons\.delete\.showLabel/,
    );
  });
});

describe("parseQuickaduiConfig — resource endpoints", () => {
  it("omits endpoints entirely when the config doesn't set it — today's default, DummyJSON-style conventions", () => {
    const config = parseQuickaduiConfig(minimalValidConfig());
    expect(config.resources[0]?.endpoints).toBeUndefined();
  });

  it("parses just a create.path override — the common case for a real REST backend with no DummyJSON-style /add suffix", () => {
    const raw = {
      resources: [
        {
          name: "book",
          fields: [{ name: "title", type: "string" }],
          endpoints: { create: { path: "books" } },
        },
      ],
    };
    const config = parseQuickaduiConfig(raw);
    expect(config.resources[0]?.endpoints).toEqual({ create: { path: "books" } });
  });

  it("parses a full endpoints object — every action, path, method, and the list's responseShape", () => {
    const raw = {
      resources: [
        {
          name: "book",
          fields: [{ name: "title", type: "string" }],
          endpoints: {
            list: { path: "books", method: "GET", responseShape: "array" },
            get: { path: "books/{id}", method: "GET" },
            create: { path: "books", method: "POST" },
            update: { path: "books/{id}", method: "PUT" },
            delete: { path: "books/{id}", method: "DELETE" },
          },
        },
      ],
    };
    const config = parseQuickaduiConfig(raw);
    expect(config.resources[0]?.endpoints).toEqual({
      list: { path: "books", method: "GET", responseShape: "array" },
      get: { path: "books/{id}", method: "GET" },
      create: { path: "books", method: "POST" },
      update: { path: "books/{id}", method: "PUT" },
      delete: { path: "books/{id}", method: "DELETE" },
    });
  });

  it("throws when endpoints isn't an object", () => {
    const raw = {
      resources: [
        { name: "book", fields: [{ name: "title", type: "string" }], endpoints: "books" },
      ],
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/resources\[0\]\.endpoints/);
  });

  it("throws when one action isn't an object", () => {
    const raw = {
      resources: [
        {
          name: "book",
          fields: [{ name: "title", type: "string" }],
          endpoints: { create: "books" },
        },
      ],
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/resources\[0\]\.endpoints\.create/);
  });

  it("throws when method isn't one of GET/POST/PUT/PATCH/DELETE", () => {
    const raw = {
      resources: [
        {
          name: "book",
          fields: [{ name: "title", type: "string" }],
          endpoints: { create: { method: "FETCH" } },
        },
      ],
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/resources\[0\]\.endpoints\.create\.method/);
  });

  it.each(["get", "update", "delete"])(
    'throws when %s\'s path is missing the required "{id}" placeholder',
    (action) => {
      const raw = {
        resources: [
          {
            name: "book",
            fields: [{ name: "title", type: "string" }],
            endpoints: { [action]: { path: "books" } },
          },
        ],
      };
      expect(() => parseQuickaduiConfig(raw)).toThrow(
        new RegExp(`resources\\[0\\]\\.endpoints\\.${action}\\.path`),
      );
    },
  );

  it.each(["list", "create"])(
    "doesn't require an \"{id}\" placeholder in %s's path — there's no id in scope yet",
    (action) => {
      const raw = {
        resources: [
          {
            name: "book",
            fields: [{ name: "title", type: "string" }],
            endpoints: { [action]: { path: "books" } },
          },
        ],
      };
      expect(() => parseQuickaduiConfig(raw)).not.toThrow();
    },
  );

  it('throws when list.responseShape isn\'t "wrapped" or "array"', () => {
    const raw = {
      resources: [
        {
          name: "book",
          fields: [{ name: "title", type: "string" }],
          endpoints: { list: { responseShape: "paginated" } },
        },
      ],
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(
      /resources\[0\]\.endpoints\.list\.responseShape/,
    );
  });
});

describe("parseQuickaduiConfig — view errors", () => {
  it("throws when a view references a field the resource doesn't declare", () => {
    const raw = {
      resources: [
        {
          name: "product",
          fields: [{ name: "title", type: "string" }],
          views: { list: { fields: ["title", "sku"] } },
        },
      ],
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/references field "sku"/);
  });

  it("throws when a view's \"fields\" isn't an array", () => {
    const raw = {
      resources: [
        {
          name: "product",
          fields: [{ name: "title", type: "string" }],
          views: { list: { fields: "title" } },
        },
      ],
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/views\.list\.fields/);
  });

  it('throws when "views" isn\'t an object', () => {
    const raw = {
      resources: [{ name: "product", fields: [{ name: "title", type: "string" }], views: "list" }],
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/resources\[0\]\.views/);
  });
});

describe("parseQuickaduiConfig — action errors", () => {
  it('throws when a "navigate" action has no "to"', () => {
    const raw = {
      resources: [
        {
          name: "product",
          fields: [{ name: "title", type: "string" }],
          views: { list: { fields: ["title"], actions: [{ label: "View", kind: "navigate" }] } },
        },
      ],
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/kind "navigate" but no "to"/);
  });

  it("throws on an unknown action kind", () => {
    const raw = {
      resources: [
        {
          name: "product",
          fields: [{ name: "title", type: "string" }],
          views: { list: { fields: ["title"], actions: [{ label: "Do", kind: "explode" }] } },
        },
      ],
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/actions\[0\]\.kind/);
  });

  it("throws when an action's role isn't declared in auth.roles", () => {
    const raw = {
      auth: { enabled: true, roles: ["admin"] },
      resources: [
        {
          name: "product",
          fields: [{ name: "title", type: "string" }],
          views: {
            list: {
              fields: ["title"],
              actions: [{ label: "Delete", kind: "delete", role: ["superadmin"] }],
            },
          },
        },
      ],
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(
      /role "superadmin" isn't declared in "auth.roles"/,
    );
  });

  it("throws when an action declares a role but auth.roles is unset entirely", () => {
    const raw = {
      resources: [
        {
          name: "product",
          fields: [{ name: "title", type: "string" }],
          views: {
            list: {
              fields: ["title"],
              actions: [{ label: "Delete", kind: "delete", role: ["admin"] }],
            },
          },
        },
      ],
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/which is empty\/unset/);
  });

  it("throws when an action has no label", () => {
    const raw = {
      resources: [
        {
          name: "product",
          fields: [{ name: "title", type: "string" }],
          views: { list: { fields: ["title"], actions: [{ kind: "submit" }] } },
        },
      ],
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/actions\[0\]\.label/);
  });
});

describe("parseQuickaduiConfig — auth errors", () => {
  it("throws when auth.enabled is missing", () => {
    expect(() =>
      parseQuickaduiConfig({
        auth: {},
        resources: [{ name: "p", fields: [{ name: "n", type: "string" }] }],
      }),
    ).toThrow(/auth\.enabled/);
  });

  it("throws when auth.roles isn't an array of strings", () => {
    const raw = {
      auth: { enabled: true, roles: [1, 2] },
      resources: [{ name: "p", fields: [{ name: "n", type: "string" }] }],
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/auth\.roles/);
  });
});

describe("parseQuickaduiConfig — nav errors", () => {
  it("throws when a nav item is missing href", () => {
    const raw = {
      resources: [{ name: "p", fields: [{ name: "n", type: "string" }] }],
      navbar: { enabled: true, items: [{ label: "Home" }] },
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/navbar\.items\[0\]\.href/);
  });

  it("throws when a nav item's role isn't declared in auth.roles", () => {
    const raw = {
      resources: [{ name: "p", fields: [{ name: "n", type: "string" }] }],
      navbar: { enabled: true, items: [{ label: "Admin", href: "#/admin", role: ["admin"] }] },
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/role "admin" isn't declared in "auth.roles"/);
  });

  it("throws when navbar.enabled is missing", () => {
    const raw = {
      resources: [{ name: "p", fields: [{ name: "n", type: "string" }] }],
      navbar: { brand: "X" },
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/navbar\.enabled/);
  });

  it("throws when a nav item's icon isn't a string", () => {
    const raw = {
      resources: [{ name: "p", fields: [{ name: "n", type: "string" }] }],
      navbar: { enabled: true, items: [{ label: "Home", href: "#/", icon: 42 }] },
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/navbar\.items\[0\]\.icon/);
  });

  it("throws when navbar.logo isn't a string", () => {
    const raw = {
      resources: [{ name: "p", fields: [{ name: "n", type: "string" }] }],
      navbar: { enabled: true, logo: 42 },
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/navbar\.logo/);
  });

  it("parses sidebar.logo independently of navbar.logo", () => {
    const raw = {
      resources: [{ name: "p", fields: [{ name: "n", type: "string" }] }],
      sidebar: { enabled: true, logo: "https://example.com/logo.png" },
    };
    const config = parseQuickaduiConfig(raw);
    expect(config.sidebar?.logo).toBe("https://example.com/logo.png");
    expect(config.navbar?.logo).toBeUndefined();
  });
});

describe("parseQuickaduiConfig — dashboard errors", () => {
  it("throws when a widget references an unknown resource", () => {
    const raw = {
      resources: [{ name: "product", fields: [{ name: "title", type: "string" }] }],
      dashboard: {
        enabled: true,
        widgets: [{ id: "w1", type: "stat", title: "Count", resource: "category" }],
      },
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/references resource "category"/);
  });

  it("throws on an unknown widget type", () => {
    const raw = {
      resources: [{ name: "product", fields: [{ name: "title", type: "string" }] }],
      dashboard: {
        enabled: true,
        widgets: [{ id: "w1", type: "chart", title: "Count", resource: "product" }],
      },
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/dashboard\.widgets\[0\]\.type/);
  });

  it("throws on an invalid columns value", () => {
    const raw = {
      resources: [{ name: "product", fields: [{ name: "title", type: "string" }] }],
      dashboard: { enabled: true, columns: 7 },
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/dashboard\.columns/);
  });

  it("throws on a non-positive-integer widget limit", () => {
    const raw = {
      resources: [{ name: "product", fields: [{ name: "title", type: "string" }] }],
      dashboard: {
        enabled: true,
        widgets: [{ id: "w1", type: "list", title: "Recent", resource: "product", limit: 0 }],
      },
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/dashboard\.widgets\[0\]\.limit/);
  });

  it("throws when dashboard.enabled is missing", () => {
    const raw = {
      resources: [{ name: "product", fields: [{ name: "title", type: "string" }] }],
      dashboard: {},
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/dashboard\.enabled/);
  });

  it("throws on two widgets sharing the same id", () => {
    const raw = {
      resources: [{ name: "product", fields: [{ name: "title", type: "string" }] }],
      dashboard: {
        enabled: true,
        widgets: [
          { id: "w1", type: "stat", title: "Count", resource: "product" },
          { id: "w1", type: "list", title: "Recent", resource: "product" },
        ],
      },
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/duplicate widget id "w1"/);
  });

  it("allows two widgets with different ids referencing the same resource", () => {
    const raw = {
      resources: [{ name: "product", fields: [{ name: "title", type: "string" }] }],
      dashboard: {
        enabled: true,
        widgets: [
          { id: "w1", type: "stat", title: "Count", resource: "product" },
          { id: "w2", type: "list", title: "Recent", resource: "product" },
        ],
      },
    };
    expect(() => parseQuickaduiConfig(raw)).not.toThrow();
  });
});

describe("parseQuickaduiConfig — theme/footer/project errors", () => {
  it("throws on an unknown theme.default value", () => {
    const raw = {
      theme: { default: "sepia" },
      resources: [{ name: "p", fields: [{ name: "n", type: "string" }] }],
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/theme\.default/);
  });

  it("throws when footer.enabled is missing", () => {
    const raw = {
      resources: [{ name: "p", fields: [{ name: "n", type: "string" }] }],
      footer: { content: "x" },
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/footer\.enabled/);
  });

  it("throws when project isn't an object", () => {
    const raw = {
      project: "My Shop",
      resources: [{ name: "p", fields: [{ name: "n", type: "string" }] }],
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/project/);
  });
});

describe("parseQuickaduiConfig — theme.colors", () => {
  it("parses valid hex colors, each family independently optional", () => {
    const raw = {
      resources: [{ name: "p", fields: [{ name: "n", type: "string" }] }],
      theme: { colors: { accent: "#2563EB", danger: "#DC2626" } },
    };
    const config = parseQuickaduiConfig(raw);
    expect(config.theme?.colors).toEqual({ accent: "#2563EB", danger: "#DC2626" });
  });

  it("throws when a color isn't a valid #RRGGBB hex string", () => {
    const raw = {
      resources: [{ name: "p", fields: [{ name: "n", type: "string" }] }],
      theme: { colors: { accent: "blue" } },
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/theme\.colors\.accent/);
  });

  it("throws on a 3-digit hex shorthand — only full #RRGGBB is accepted", () => {
    const raw = {
      resources: [{ name: "p", fields: [{ name: "n", type: "string" }] }],
      theme: { colors: { accent: "#FFF" } },
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/theme\.colors\.accent/);
  });

  it("omits theme.colors entirely when not set", () => {
    const config = parseQuickaduiConfig(minimalValidConfig());
    expect(config.theme).toBeUndefined();
  });

  it("both theme.default and theme.colors can be set together", () => {
    const raw = {
      resources: [{ name: "p", fields: [{ name: "n", type: "string" }] }],
      theme: { default: "dark", colors: { accent: "#2563EB" } },
    };
    const config = parseQuickaduiConfig(raw);
    expect(config.theme).toEqual({ default: "dark", colors: { accent: "#2563EB" } });
  });
});

describe("parseQuickaduiConfig — resource toasts", () => {
  it("parses all six toast message keys, each independently optional", () => {
    const raw = {
      resources: [
        {
          name: "product",
          fields: [{ name: "title", type: "string" }],
          toasts: {
            createSuccess: "Created!",
            createError: "Create failed.",
            updateSuccess: "Updated!",
            updateError: "Update failed.",
            deleteSuccess: "Deleted!",
            deleteError: "Delete failed.",
          },
        },
      ],
    };
    const config = parseQuickaduiConfig(raw);
    expect(config.resources[0]?.toasts).toEqual({
      createSuccess: "Created!",
      createError: "Create failed.",
      updateSuccess: "Updated!",
      updateError: "Update failed.",
      deleteSuccess: "Deleted!",
      deleteError: "Delete failed.",
    });
  });

  it("accepts a partial toasts object — just one key is enough to opt in", () => {
    const raw = {
      resources: [
        {
          name: "product",
          fields: [{ name: "title", type: "string" }],
          toasts: { deleteSuccess: "Gone." },
        },
      ],
    };
    const config = parseQuickaduiConfig(raw);
    expect(config.resources[0]?.toasts).toEqual({ deleteSuccess: "Gone." });
  });

  it("omits toasts entirely when not set — today's default, no toasts", () => {
    const config = parseQuickaduiConfig(minimalValidConfig());
    expect(config.resources[0]?.toasts).toBeUndefined();
  });

  it("throws when toasts isn't an object", () => {
    const raw = {
      resources: [
        { name: "product", fields: [{ name: "title", type: "string" }], toasts: "yes please" },
      ],
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/resources\[0\]\.toasts/);
  });

  it("throws when a toast message isn't a string", () => {
    const raw = {
      resources: [
        {
          name: "product",
          fields: [{ name: "title", type: "string" }],
          toasts: { createSuccess: 42 },
        },
      ],
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/resources\[0\]\.toasts\.createSuccess/);
  });
});

describe("parseQuickaduiConfig — resource confirmDelete", () => {
  it("accepts true", () => {
    const raw = {
      resources: [
        { name: "product", fields: [{ name: "title", type: "string" }], confirmDelete: true },
      ],
    };
    const config = parseQuickaduiConfig(raw);
    expect(config.resources[0]?.confirmDelete).toBe(true);
  });

  it("accepts a custom message string", () => {
    const raw = {
      resources: [
        {
          name: "product",
          fields: [{ name: "title", type: "string" }],
          confirmDelete: "This will permanently remove the product.",
        },
      ],
    };
    const config = parseQuickaduiConfig(raw);
    expect(config.resources[0]?.confirmDelete).toBe("This will permanently remove the product.");
  });

  it("omits confirmDelete entirely when not set — today's default, no confirmation", () => {
    const config = parseQuickaduiConfig(minimalValidConfig());
    expect(config.resources[0]?.confirmDelete).toBeUndefined();
  });

  it("throws when confirmDelete is neither a boolean nor a string", () => {
    const raw = {
      resources: [
        { name: "product", fields: [{ name: "title", type: "string" }], confirmDelete: 42 },
      ],
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/resources\[0\]\.confirmDelete/);
  });

  it("throws when confirmDelete is an empty string", () => {
    const raw = {
      resources: [
        { name: "product", fields: [{ name: "title", type: "string" }], confirmDelete: "" },
      ],
    };
    expect(() => parseQuickaduiConfig(raw)).toThrow(/resources\[0\]\.confirmDelete/);
  });
});
