import { describe, expect, it } from "vitest";
import {
  renderResourceApi,
  renderResourceFiles,
  renderResourceFormPage,
  renderResourceListPage,
  renderResourceSchema,
  type ResourceTemplateOptions,
} from "./resource-templates";

const options: ResourceTemplateOptions = {
  typeName: "Product",
  fields: [
    { name: "title", type: "string" },
    { name: "category", type: "string" },
    { name: "price", type: "number" },
    { name: "stock", type: "number" },
  ],
  endpoint: "products",
  apiBase: "https://dummyjson.com",
};

describe("renderResourceSchema", () => {
  it("builds a zod field per input field, in order", () => {
    const file = renderResourceSchema(options);
    expect(file.path).toBe("src/schemas/product.schema.ts");
    expect(file.contents).toContain('title: z.string().min(1, "Title is required."),');
    expect(file.contents).toContain('category: z.string().min(1, "Category is required."),');
    expect(file.contents).toContain("price: z.number(),");
    expect(file.contents).toContain("stock: z.number(),");
    expect(file.contents).toContain("export const productSchema");
    expect(file.contents).toContain("export type ProductInput");
    expect(file.contents).toContain("export interface Product extends ProductInput");
  });

  it("rejects an empty string but not a plain 0/false, for a required field", () => {
    const file = renderResourceSchema(options);
    // Confirms the fix's actual reasoning, not just the generated text:
    // z.string().min(1) must fail on "" while z.number() alone must keep
    // accepting a plain 0 (a real value, not a "not filled in" marker).
    const zodStringField = /z\.string\(\)\.min\(1, "Title is required\."\)/;
    const zodNumberField = /price: z\.number\(\),/;
    expect(zodStringField.test(file.contents)).toBe(true);
    expect(zodNumberField.test(file.contents)).toBe(true);
  });
});

describe("renderResourceApi", () => {
  it("embeds the given endpoint and api base into every request", () => {
    const file = renderResourceApi(options);
    expect(file.path).toBe("src/api/product.api.ts");
    expect(file.contents).toContain('const API_BASE = "https://dummyjson.com";');
    expect(file.contents).toContain("/products?limit=");
    expect(file.contents).toContain("/products/add");
    expect(file.contents).toContain('method: "PUT"');
    expect(file.contents).toContain('method: "DELETE"');
    expect(file.contents).toContain("export async function listProducts(");
    expect(file.contents).toContain("export async function getProduct(");
    expect(file.contents).toContain("export async function createProduct(");
    expect(file.contents).toContain("export async function updateProduct(");
    expect(file.contents).toContain("export async function deleteProduct(");
  });

  it("warns about DummyJSON's non-persisted writes only when pointed at it", () => {
    const dummyJsonFile = renderResourceApi(options);
    expect(dummyJsonFile.contents).toContain("don't actually");

    const realBackendFile = renderResourceApi({ ...options, apiBase: "https://api.example.com" });
    expect(realBackendFile.contents).toContain('const API_BASE = "https://api.example.com";');
  });
});

describe("renderResourceApi — endpoints overrides", () => {
  it("overrides just create's path, e.g. a real REST backend with no DummyJSON-style /add suffix", () => {
    const file = renderResourceApi({ ...options, endpoints: { create: { path: "products" } } });
    expect(file.contents).toContain("/products`, {\n    method: \"POST\",");
    expect(file.contents).not.toContain("/products/add");
    // Every other action keeps its own default, untouched by the create override.
    expect(file.contents).toContain("/products?limit=");
    expect(file.contents).toContain('method: "PUT"');
    expect(file.contents).toContain('method: "DELETE"');
  });

  it("overrides an action's method", () => {
    const file = renderResourceApi({ ...options, endpoints: { update: { method: "PATCH" } } });
    expect(file.contents).toContain('method: "PATCH"');
    expect(file.contents).not.toContain('method: "PUT"');
  });

  it("substitutes a configured \"{id}\" placeholder with the generated function's own \"${id}\" template hole", () => {
    const file = renderResourceApi({ ...options, endpoints: { get: { path: "products/{id}/details" } } });
    expect(file.contents).toContain("fetch(`${API_BASE}/products/${id}/details`)");
  });

  it("defaults list's responseShape to \"wrapped\" — a DummyJSON-shaped interface with total/skip/limit and server-side pagination params", () => {
    const file = renderResourceApi(options);
    expect(file.contents).toContain("export interface ProductsListResult {");
    expect(file.contents).toContain('readonly "products": readonly Product[];');
    expect(file.contents).toContain("export async function listProducts(options: ListProductsOptions = {}):");
    expect(file.contents).toContain("?limit=${limit}&skip=${skip}");
  });

  it("switches to a plain array type/response and drops pagination params when responseShape is \"array\"", () => {
    const file = renderResourceApi({ ...options, endpoints: { list: { responseShape: "array" } } });
    expect(file.contents).toContain("export type ProductsListResult = readonly Product[];");
    expect(file.contents).not.toContain("export interface ProductsListResult");
    expect(file.contents).toContain("export async function listProducts(): Promise<ProductsListResult> {");
    expect(file.contents).not.toContain("?limit=");
    expect(file.contents).not.toContain("ListProductsOptions");
  });

  it("resolves every action from a single list/get/create/update/delete override object at once", () => {
    const file = renderResourceApi({
      ...options,
      endpoints: {
        list: { path: "products", responseShape: "array" },
        get: { path: "products/{id}" },
        create: { path: "products" },
        update: { path: "products/{id}" },
        delete: { path: "products/{id}" },
      },
    });
    expect(file.contents).not.toContain("/products/add");
    expect(file.contents).toContain("export type ProductsListResult = readonly Product[];");
  });
});

describe("renderResourceListPage", () => {
  it("renders one table column per field plus an actions column", () => {
    const file = renderResourceListPage(options);
    expect(file.path).toBe("src/pages/product/ProductListPage.tsx");
    expect(file.contents).toContain("<TableHead>Title</TableHead>");
    expect(file.contents).toContain("<TableHead>Category</TableHead>");
    expect(file.contents).toContain("<TableHead>Price</TableHead>");
    expect(file.contents).toContain("<TableHead>Stock</TableHead>");
    expect(file.contents).toContain('<TableHead className="text-right">Actions</TableHead>');
    expect(file.contents).toContain("export function ProductListPage()");
    expect(file.contents).toContain('href="#/products/new"');
  });

  it("shows a centered Spinner (not plain text) while the list is loading", () => {
    const file = renderResourceListPage(options);
    expect(file.contents).toContain('import { Button, Spinner } from "@quickadui/core";');
    expect(file.contents).toContain("<Spinner />");
    expect(file.contents).not.toContain("Loading…");
  });

  it("wires the Delete button's isLoading to a per-row deletingId, cleared in a finally", () => {
    const file = renderResourceListPage(options);
    expect(file.contents).toContain("const [deletingId, setDeletingId] = useState<number | undefined>(undefined);");
    expect(file.contents).toContain("isLoading={deletingId === item.id}");
    expect(file.contents).toContain(`async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await deleteProduct(id);
      setItems((current) => current.filter((item) => item.id !== id));
    } finally {
      setDeletingId(undefined);
    }
  }`);
  });

  it("disables Previous/Next at the page boundaries instead of leaving them always clickable", () => {
    const file = renderResourceListPage(options);
    expect(file.contents).toContain("disabled={skip === 0}");
    expect(file.contents).toContain("disabled={skip + PAGE_SIZE >= total}");
  });

  it("computes currentPage/totalPages from skip/total and renders numbered page links via getPaginationRange", () => {
    const file = renderResourceListPage(options);
    expect(file.contents).toContain("getPaginationRange,");
    expect(file.contents).toContain("PAGINATION_ELLIPSIS,");
    expect(file.contents).toContain("PaginationLink,");
    expect(file.contents).toContain("PaginationEllipsis,");
    expect(file.contents).toContain("const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));");
    expect(file.contents).toContain("const currentPage = Math.floor(skip / PAGE_SIZE) + 1;");
    expect(file.contents).toContain("{getPaginationRange(currentPage, totalPages).map((page, index) =>");
    expect(file.contents).toContain("page === PAGINATION_ELLIPSIS ? (");
    expect(file.contents).toContain("isActive={page === currentPage}");
    expect(file.contents).toContain("onClick={() => setSkip((page - 1) * PAGE_SIZE)}");
  });

  it("stays text-only for every button when buttonIcons is unset — today's default", () => {
    const file = renderResourceListPage(options);
    expect(file.contents).not.toContain("@quickadui/icons");
    expect(file.contents).toContain('<a href="#/products/new">New product</a>');
  });

  it("puts the create icon before the label inside the New button's <a>", () => {
    const file = renderResourceListPage({ ...options, buttonIcons: { create: "Plus" } });
    expect(file.contents).toContain(
      '<a href="#/products/new"><PlusIcon size={16} aria-hidden />New product</a>',
    );
  });

  it("puts the edit icon before the label inside each row's Edit <a>", () => {
    const file = renderResourceListPage({ ...options, buttonIcons: { edit: "Pencil" } });
    expect(file.contents).toContain(
      "<a href={`#/products/${item.id}/edit`}><PencilIcon size={16} aria-hidden />Edit</a>",
    );
  });

  it("passes the delete icon through Button's own icon prop, since Delete isn't asChild", () => {
    const file = renderResourceListPage({ ...options, buttonIcons: { delete: "Trash" } });
    expect(file.contents).toContain("icon={<TrashIcon size={16} aria-hidden />}");
    expect(file.contents).toContain("onClick={() => handleDelete(item.id)}");
  });

  it("imports exactly the icons actually used, deduplicated and sorted, and nothing when unused", () => {
    const withIcons = renderResourceListPage({ ...options, buttonIcons: { create: "Plus", delete: "Plus" } });
    expect(withIcons.contents).toContain('import { PlusIcon } from "@quickadui/icons";');

    const withoutIcons = renderResourceListPage(options);
    expect(withoutIcons.contents).not.toContain("@quickadui/icons");
  });

  it("renders an icon-only New button via IconButton when create's showLabel is false, with the text moved to aria-label", () => {
    const file = renderResourceListPage({
      ...options,
      buttonIcons: { create: { icon: "Plus", showLabel: false } },
    });
    expect(file.contents).toContain(
      '<IconButton asChild variant="solid" aria-label="New product">\n          <a href="#/products/new"><PlusIcon size={16} aria-hidden /></a>\n        </IconButton>',
    );
    expect(file.contents).not.toContain("New product</a>");
  });

  it("renders an icon-only Edit button via IconButton when edit's showLabel is false", () => {
    const file = renderResourceListPage({
      ...options,
      buttonIcons: { edit: { icon: "Pencil", showLabel: false } },
    });
    expect(file.contents).toContain(
      '<IconButton asChild variant="outline" size="sm" aria-label="Edit">\n                      <a href={`#/products/${item.id}/edit`}><PencilIcon size={16} aria-hidden /></a>\n                    </IconButton>',
    );
  });

  it("renders an icon-only Delete button via IconButton with a manual Spinner swap, since IconButton has no isLoading", () => {
    const file = renderResourceListPage({
      ...options,
      buttonIcons: { delete: { icon: "Trash", showLabel: false } },
    });
    expect(file.contents).toContain('className="text-danger-11 hover:bg-danger-3"');
    expect(file.contents).toContain('aria-label="Delete"');
    expect(file.contents).toContain("disabled={deletingId === item.id}");
    expect(file.contents).toContain(
      "{deletingId === item.id ? <Spinner size=\"sm\" /> : <TrashIcon size={16} aria-hidden />}",
    );
    expect(file.contents).not.toContain(">\n                      Delete\n");
  });

  it("drops the Button import and adds IconButton when every rendered button on the page is icon-only", () => {
    const file = renderResourceListPage({
      ...options,
      buttonIcons: {
        create: { icon: "Plus", showLabel: false },
        edit: { icon: "Pencil", showLabel: false },
        delete: { icon: "Trash", showLabel: false },
      },
    });
    expect(file.contents).toContain('import { IconButton, Spinner } from "@quickadui/core";');
    expect(file.contents).not.toContain("import { Button,");
  });

  it("keeps Button alongside IconButton when only some buttons on the page are icon-only", () => {
    const file = renderResourceListPage({
      ...options,
      buttonIcons: { create: { icon: "Plus", showLabel: false } },
    });
    expect(file.contents).toContain('import { Button, IconButton, Spinner } from "@quickadui/core";');
  });

  it("a plain string still means icon + visible text, same as before showLabel existed", () => {
    const file = renderResourceListPage({ ...options, buttonIcons: { create: "Plus" } });
    expect(file.contents).toContain('import { Button, Spinner } from "@quickadui/core";');
    expect(file.contents).not.toContain("IconButton");
  });
});

describe("renderResourceListPage — toasts", () => {
  it("stays exactly as before when toasts is unset — no import, no toast() calls, handleDelete unchanged", () => {
    const file = renderResourceListPage(options);
    expect(file.contents).not.toContain("@quickadui/overlays");
    expect(file.contents).not.toContain("toast(");
    expect(file.contents).toContain(`async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await deleteProduct(id);
      setItems((current) => current.filter((item) => item.id !== id));
    } finally {
      setDeletingId(undefined);
    }
  }`);
  });

  it("wires a success and an error toast into handleDelete when toasts is set, using the configured messages", () => {
    const file = renderResourceListPage({
      ...options,
      toasts: { deleteSuccess: "Product removed.", deleteError: "Could not remove product." },
    });
    expect(file.contents).toContain('import { toast } from "@quickadui/overlays";');
    expect(file.contents).toContain('toast({ title: "Product removed.", variant: "success" });');
    expect(file.contents).toContain('title: "Could not remove product.",');
    expect(file.contents).toContain("description: cause instanceof Error ? cause.message : String(cause),");
    expect(file.contents).toContain('variant: "danger",');
  });

  it("fills in a generic default message for any toast key left unset, once toasts is opted into at all", () => {
    const file = renderResourceListPage({ ...options, toasts: { createSuccess: "Made one!" } });
    expect(file.contents).toContain('toast({ title: "Product deleted.", variant: "success" });');
    expect(file.contents).toContain('title: "Failed to delete product.",');
  });
});

describe("renderResourceListPage — confirmDelete", () => {
  it("leaves Delete's onClick calling handleDelete directly, and renders no Modal, when confirmDelete is unset", () => {
    const file = renderResourceListPage(options);
    expect(file.contents).not.toContain("@quickadui/overlays");
    expect(file.contents).not.toContain("pendingDeleteId");
    expect(file.contents).toContain("onClick={() => handleDelete(item.id)}");
  });

  it("redirects Delete's onClick to open a confirm Modal instead, when confirmDelete is true", () => {
    const file = renderResourceListPage({ ...options, confirmDelete: true });
    expect(file.contents).toContain(
      "const [pendingDeleteId, setPendingDeleteId] = useState<number | undefined>(undefined);",
    );
    expect(file.contents).toContain("onClick={() => setPendingDeleteId(item.id)}");
    expect(file.contents).toContain(
      'import { Modal, ModalClose, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from "@quickadui/overlays";',
    );
    expect(file.contents).toContain("Delete this product? This can't be undone.");
    expect(file.contents).toContain("<ModalTitle>Confirm delete</ModalTitle>");
  });

  it("uses a custom confirmDelete string as the Modal's description instead of the generic default", () => {
    const file = renderResourceListPage({
      ...options,
      confirmDelete: "This removes the product from every order too.",
    });
    expect(file.contents).toContain("This removes the product from every order too.");
    expect(file.contents).not.toContain("This can't be undone.");
  });

  it("the Modal's own Delete button calls the real handleDelete and clears pendingDeleteId", () => {
    const file = renderResourceListPage({ ...options, confirmDelete: true });
    expect(file.contents).toContain(`onClick={() => {
                if (pendingDeleteId !== undefined) {
                  handleDelete(pendingDeleteId);
                }
                setPendingDeleteId(undefined);
              }}`);
  });

  it("combines toast and Modal imports into one @quickadui/overlays line when both are on", () => {
    const file = renderResourceListPage({
      ...options,
      confirmDelete: true,
      toasts: { deleteSuccess: "Gone." },
    });
    expect(file.contents).toContain(
      'import { Modal, ModalClose, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle, toast } from "@quickadui/overlays";',
    );
  });
});

describe("renderResourceListPage — endpoints.list.responseShape", () => {
  it("keeps today's default (server-paginated, wrapped) when endpoints is unset", () => {
    const file = renderResourceListPage(options);
    expect(file.contents).toContain("const [total, setTotal] = useState(0);");
    expect(file.contents).toContain("listProducts({ skip, limit: PAGE_SIZE })");
    expect(file.contents).toContain("const pagedItems = items;");
    expect(file.contents).not.toContain(".slice(skip, skip + PAGE_SIZE)");
  });

  it("fetches once and paginates client-side when responseShape is \"array\"", () => {
    const file = renderResourceListPage({ ...options, endpoints: { list: { responseShape: "array" } } });
    expect(file.contents).toContain("listProducts()\n      .then((result) => {");
    expect(file.contents).toContain("setItems(result);");
    expect(file.contents).not.toContain('setItems(result["products"]);');
    expect(file.contents).not.toContain("const [total, setTotal] = useState(0);");
    expect(file.contents).toContain("const total = items.length;");
    expect(file.contents).toContain("const pagedItems = items.slice(skip, skip + PAGE_SIZE);");
    // Fetches the full list once on mount — no server-side page to re-fetch when skip changes.
    expect(file.contents).toContain("}, []);");
  });

  it("still renders the same pagination JSX either way — only the state/effect section differs", () => {
    const wrapped = renderResourceListPage(options);
    const array = renderResourceListPage({ ...options, endpoints: { list: { responseShape: "array" } } });
    for (const file of [wrapped, array]) {
      expect(file.contents).toContain("const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));");
      expect(file.contents).toContain("const currentPage = Math.floor(skip / PAGE_SIZE) + 1;");
      expect(file.contents).toContain("{pagedItems.map((item) => (");
      expect(file.contents).toContain("disabled={skip + PAGE_SIZE >= total}");
    }
  });
});

describe("renderResourceFormPage", () => {
  it("renders a text FormField for a string field and a numeric one for a number field", () => {
    const file = renderResourceFormPage(options);
    expect(file.path).toBe("src/pages/product/ProductFormPage.tsx");
    expect(file.contents).toContain('name="title"');
    expect(file.contents).toContain('name="price"');
    expect(file.contents).toContain("valueAsNumber");
    expect(file.contents).not.toContain("Checkbox");
  });

  it("renders a Checkbox for a boolean field", () => {
    const file = renderResourceFormPage({
      typeName: "Todo",
      fields: [
        { name: "todo", type: "string" },
        { name: "completed", type: "boolean" },
      ],
      endpoint: "todos",
      apiBase: "https://dummyjson.com",
    });
    expect(file.contents).toContain("Checkbox,");
    expect(file.contents).toContain('name="completed"');
    expect(file.contents).toContain("onCheckedChange");
  });

  it("wires the submit Button's isLoading to form.formState.isSubmitting", () => {
    const file = renderResourceFormPage(options);
    expect(file.contents).toContain('import { Button, Spinner } from "@quickadui/core";');
    expect(file.contents).toContain("<Button type=\"submit\" isLoading={form.formState.isSubmitting}>");
    expect(file.contents).not.toContain("disabled={form.formState.isSubmitting}");
  });

  it("shows a centered Spinner (not plain text) while an existing item is loading for edit", () => {
    const file = renderResourceFormPage(options);
    expect(file.contents).toContain("<Spinner />");
    expect(file.contents).not.toContain("Loading…");
  });

  it("stays text-only for Save/Cancel when buttonIcons is unset — today's default", () => {
    const file = renderResourceFormPage(options);
    expect(file.contents).not.toContain("@quickadui/icons");
    expect(file.contents).toContain('<a href="#/products">Cancel</a>');
  });

  it("passes the save icon through Button's own icon prop, since the submit button isn't asChild", () => {
    const file = renderResourceFormPage({ ...options, buttonIcons: { save: "Check" } });
    expect(file.contents).toContain(
      '<Button type="submit" isLoading={form.formState.isSubmitting}\n            icon={<CheckIcon size={16} aria-hidden />}>',
    );
    expect(file.contents).toContain('import { CheckIcon } from "@quickadui/icons";');
  });

  it("puts the cancel icon before the label inside Cancel's <a> (asChild, so Button's icon prop is a no-op)", () => {
    const file = renderResourceFormPage({ ...options, buttonIcons: { cancel: "Close" } });
    expect(file.contents).toContain('<a href="#/products"><CloseIcon size={16} aria-hidden />Cancel</a>');
  });

  it("renders an icon-only submit button via IconButton with a manual Spinner swap when save's showLabel is false", () => {
    const file = renderResourceFormPage({
      ...options,
      buttonIcons: { save: { icon: "Check", showLabel: false } },
    });
    expect(file.contents).toContain('aria-label={isEditing ? "Save" : "Create"}');
    expect(file.contents).toContain("disabled={form.formState.isSubmitting}");
    expect(file.contents).toContain(
      '{form.formState.isSubmitting ? <Spinner size="sm" /> : <CheckIcon size={16} aria-hidden />}',
    );
    expect(file.contents).not.toContain('{isEditing ? "Save" : "Create"}\n          </Button>');
  });

  it("renders an icon-only Cancel button via IconButton when cancel's showLabel is false", () => {
    const file = renderResourceFormPage({
      ...options,
      buttonIcons: { cancel: { icon: "Close", showLabel: false } },
    });
    expect(file.contents).toContain(
      '<IconButton asChild variant="ghost" aria-label="Cancel">\n            <a href="#/products"><CloseIcon size={16} aria-hidden /></a>\n          </IconButton>',
    );
  });

  it("drops the Button import and adds IconButton when both Save and Cancel are icon-only", () => {
    const file = renderResourceFormPage({
      ...options,
      buttonIcons: { save: { icon: "Check", showLabel: false }, cancel: { icon: "Close", showLabel: false } },
    });
    expect(file.contents).toContain('import { IconButton, Spinner } from "@quickadui/core";');
    expect(file.contents).not.toContain("import { Button,");
  });
});

describe("renderResourceFormPage — toasts", () => {
  it("leaves onSubmit byte-identical and adds no @quickadui/overlays import when toasts is unset", () => {
    const file = renderResourceFormPage(options);
    expect(file.contents).not.toContain("@quickadui/overlays");
    expect(file.contents).not.toContain("toast(");
    expect(file.contents).toContain(
      `  async function onSubmit(values: ProductInput) {
    setSubmitError(undefined);
    try {
      if (productId !== undefined) {
        await updateProduct(productId, values);
      } else {
        await createProduct(values);
      }
      window.location.hash = "#/products";
    } catch (cause) {
      setSubmitError(cause instanceof Error ? cause.message : String(cause));
    }
  }`,
    );
  });

  it("wires success/error toast() calls into both the update and create branches with configured messages", () => {
    const file = renderResourceFormPage({
      ...options,
      toasts: {
        updateSuccess: "Saved it.",
        createSuccess: "Made it.",
        updateError: "Could not save.",
        createError: "Could not create.",
      },
    });
    expect(file.contents).toContain('import { toast } from "@quickadui/overlays";');
    expect(file.contents).toContain(
      `      if (productId !== undefined) {
        await updateProduct(productId, values);
        toast({ title: "Saved it.", variant: "success" });
      } else {
        await createProduct(values);
        toast({ title: "Made it.", variant: "success" });
      }`,
    );
    expect(file.contents).toContain(
      `      setSubmitError(cause instanceof Error ? cause.message : String(cause));
      toast({
        title: isEditing ? "Could not save." : "Could not create.",
        description: cause instanceof Error ? cause.message : String(cause),
        variant: "danger",
      });`,
    );
  });

  it("falls back to the generic default message for any toast key left unset", () => {
    const file = renderResourceFormPage({
      ...options,
      toasts: { createSuccess: "Made it." },
    });
    expect(file.contents).toContain('toast({ title: "Made it.", variant: "success" });');
    expect(file.contents).toContain('toast({ title: "Product updated.", variant: "success" });');
    expect(file.contents).toContain(
      'title: isEditing ? "Failed to update product." : "Failed to create product.",',
    );
  });
});

describe("renderResourceFiles", () => {
  it("returns all four files with distinct paths", () => {
    const files = renderResourceFiles(options);
    const paths = files.map((file) => file.path);
    expect(paths).toEqual([
      "src/schemas/product.schema.ts",
      "src/api/product.api.ts",
      "src/pages/product/ProductListPage.tsx",
      "src/pages/product/ProductFormPage.tsx",
    ]);
    expect(new Set(paths).size).toBe(paths.length);
    for (const file of files) {
      expect(file.contents.length).toBeGreaterThan(0);
    }
  });
});
