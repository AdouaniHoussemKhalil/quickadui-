import { describe, expect, it } from "vitest";
import { renderDashboardPage } from "./dashboard-templates";

const productRef = { typeName: "Product", endpoint: "products", primaryField: "title" };
const todoRef = { typeName: "Todo", endpoint: "todos" };
const arrayRef = { typeName: "Book", endpoint: "books", primaryField: "title", responseShape: "array" as const };

describe("renderDashboardPage — basics", () => {
  it("writes to src/pages/DashboardPage.tsx", () => {
    const file = renderDashboardPage({ widgets: [] });
    expect(file.path).toBe("src/pages/DashboardPage.tsx");
  });

  it("exports DashboardPage as a named export", () => {
    const file = renderDashboardPage({ widgets: [] });
    expect(file.contents).toContain("export function DashboardPage()");
  });

  it("shows a placeholder message and mounts no WidgetGrid when there are no widgets", () => {
    const file = renderDashboardPage({ widgets: [] });
    expect(file.contents).toContain("No widgets configured yet");
    expect(file.contents).not.toContain("WidgetGrid");
    expect(file.contents).not.toContain("@quickadui/shell");
    expect(file.contents).not.toContain("WIDGET_ORDER_STORAGE_KEY");
  });
});

describe("renderDashboardPage — stat widgets", () => {
  it("fetches the resource's own list endpoint with limit: 1 and reads .total", () => {
    const file = renderDashboardPage({
      widgets: [{ id: "products-count", type: "stat", title: "Products", resource: productRef }],
    });
    expect(file.contents).toContain('import { listProducts } from "../api/product.api";');
    expect(file.contents).toContain("listProducts({ limit: 1 })");
    expect(file.contents).toContain("setTotal(result.total);");
    expect(file.contents).toContain('<StatCard label={"Products"} value={total} />');
    expect(file.contents).toContain('import { StatCard } from "@quickadui/charts";');
  });

  it("passes the widget's icon through to StatCard's icon prop and imports it", () => {
    const file = renderDashboardPage({
      widgets: [{ id: "products-count", type: "stat", title: "Products", resource: productRef, icon: "Settings" }],
    });
    expect(file.contents).toContain(
      '<StatCard label={"Products"} value={total} icon={<SettingsIcon size={16} aria-hidden />} />',
    );
    expect(file.contents).toContain('import { SettingsIcon } from "@quickadui/icons";');
  });

  it("omits the @quickadui/charts import entirely when there are no stat widgets", () => {
    const file = renderDashboardPage({
      widgets: [{ id: "recent-products", type: "list", title: "Recent", resource: productRef }],
    });
    expect(file.contents).not.toContain("@quickadui/charts");
    expect(file.contents).not.toContain("StatCard");
  });

  it("renders the widget wrapped in a (now draggable) Widget with no title (StatCard supplies its own label)", () => {
    const file = renderDashboardPage({
      widgets: [{ id: "products-count", type: "stat", title: "Products", resource: productRef }],
    });
    expect(file.contents).toContain('<Widget id={"products-count"}>');
    expect(file.contents).not.toContain("disableDrag");
  });
});

describe("renderDashboardPage — list widgets", () => {
  it("fetches with the configured limit and reads the endpoint's own array key", () => {
    const file = renderDashboardPage({
      widgets: [{ id: "recent-products", type: "list", title: "Recent products", resource: productRef, limit: 7 }],
    });
    expect(file.contents).toContain("listProducts({ limit: 7 })");
    expect(file.contents).toContain('setItems(result["products"]);');
    expect(file.contents).toContain("import type { Product } from \"../schemas/product.schema\";");
  });

  it("defaults limit to 5 when unset", () => {
    const file = renderDashboardPage({
      widgets: [{ id: "recent-products", type: "list", title: "Recent products", resource: productRef }],
    });
    expect(file.contents).toContain("listProducts({ limit: 5 })");
  });

  it("renders each row using the resource's primaryField", () => {
    const file = renderDashboardPage({
      widgets: [{ id: "recent-products", type: "list", title: "Recent products", resource: productRef }],
    });
    expect(file.contents).toContain("{String(item.title)}");
  });

  it("falls back to #<id> when the resource has no primaryField", () => {
    const file = renderDashboardPage({
      widgets: [{ id: "recent-todos", type: "list", title: "Recent todos", resource: todoRef }],
    });
    expect(file.contents).toContain("{`#${item.id}`}");
  });

  it("sets the Widget's title to a plain string prop when there's no icon, with dragging enabled", () => {
    const file = renderDashboardPage({
      widgets: [{ id: "recent-products", type: "list", title: "Recent products", resource: productRef }],
    });
    expect(file.contents).toContain('<Widget id={"recent-products"} title={"Recent products"}>');
  });

  it("combines the icon and title into one JSX expression when icon is set", () => {
    const file = renderDashboardPage({
      widgets: [{ id: "recent-products", type: "list", title: "Recent products", resource: productRef, icon: "Clock" }],
    });
    expect(file.contents).toContain(
      '<Widget id={"recent-products"} title={<span className="flex items-center gap-2"><ClockIcon size={16} aria-hidden />{"Recent products"}</span>}>',
    );
  });

  it("shows an empty-state message when items.length is 0, distinct from the loading/error states", () => {
    const file = renderDashboardPage({
      widgets: [{ id: "recent-products", type: "list", title: "Recent products", resource: productRef }],
    });
    expect(file.contents).toContain("Nothing to show yet.");
  });
});

describe('renderDashboardPage — resource.responseShape: "array"', () => {
  // Regression coverage for a real bug: before this branch existed,
  // every widget unconditionally called list<Plural>({ limit }) and read
  // result["<endpoint>"] / result.total — both are "wrapped"-shape-only.
  // Against an "array"-shape resource (see resource-templates.ts's own
  // `endpoints.list.responseShape`), list<Plural>() takes no argument and
  // resolves straight to T[], so result["<endpoint>"] silently read
  // `undefined` and the widget crashed at render (`items.map` on
  // `undefined`), past its own `error` state entirely.
  it("stat widget: calls list<Plural>() with no argument and reads result.length instead of .total", () => {
    const file = renderDashboardPage({
      widgets: [{ id: "books-count", type: "stat", title: "Books", resource: arrayRef }],
    });
    expect(file.contents).toContain("listBooks()");
    expect(file.contents).not.toContain("listBooks({ limit: 1 })");
    expect(file.contents).toContain("setTotal(result.length);");
    expect(file.contents).not.toContain("setTotal(result.total);");
  });

  it("list widget: calls list<Plural>() with no argument and truncates client-side to the configured limit", () => {
    const file = renderDashboardPage({
      widgets: [{ id: "recent-books", type: "list", title: "Recent books", resource: arrayRef, limit: 7 }],
    });
    expect(file.contents).toContain("listBooks()");
    expect(file.contents).not.toContain("listBooks({ limit: 7 })");
    expect(file.contents).toContain("setItems(result.slice(0, 7));");
    expect(file.contents).not.toContain('setItems(result["books"]);');
  });

  it("list widget: defaults the client-side slice limit to 5 when unset, same as the wrapped-shape default", () => {
    const file = renderDashboardPage({
      widgets: [{ id: "recent-books", type: "list", title: "Recent books", resource: arrayRef }],
    });
    expect(file.contents).toContain("setItems(result.slice(0, 5));");
  });

  it("a resource with no responseShape set still uses the wrapped-shape default (existing behavior unchanged)", () => {
    const file = renderDashboardPage({
      widgets: [{ id: "products-count", type: "stat", title: "Products", resource: productRef }],
    });
    expect(file.contents).toContain("listProducts({ limit: 1 })");
    expect(file.contents).toContain("setTotal(result.total);");
  });
});

describe("renderDashboardPage — grid wiring", () => {
  it("wires WidgetGrid to controlled order state, with onReorder to enable dragging", () => {
    const file = renderDashboardPage({
      widgets: [
        { id: "a", type: "stat", title: "A", resource: productRef },
        { id: "b", type: "list", title: "B", resource: productRef },
        { id: "c", type: "stat", title: "C", resource: todoRef },
      ],
    });
    expect(file.contents).toContain("<WidgetGrid items={order} onReorder={setOrder}>");
    expect(file.contents).toContain("const [order, setOrder] = useState<string[]>(loadWidgetOrder);");
    expect(file.contents).toContain('const DEFAULT_WIDGET_ORDER = ["a", "b", "c"];');
  });

  it("passes columns through only when set, omitting the prop (letting WidgetGrid's own default apply) otherwise", () => {
    const withColumns = renderDashboardPage({
      columns: 2,
      widgets: [{ id: "a", type: "stat", title: "A", resource: productRef }],
    });
    expect(withColumns.contents).toContain("<WidgetGrid items={order} onReorder={setOrder} columns={2}>");

    const withoutColumns = renderDashboardPage({
      widgets: [{ id: "a", type: "stat", title: "A", resource: productRef }],
    });
    expect(withoutColumns.contents).toContain("<WidgetGrid items={order} onReorder={setOrder}>");
    expect(withoutColumns.contents).not.toContain("columns=");
  });

  it("builds a widgetElements map keyed by id, each entry a keyed <XWidget /> matching each widget's own function", () => {
    const file = renderDashboardPage({
      widgets: [
        { id: "products-count", type: "stat", title: "Products", resource: productRef },
        { id: "recent-products", type: "list", title: "Recent", resource: productRef },
      ],
    });
    expect(file.contents).toContain('"products-count": <ProductsCountWidget key={"products-count"} />,');
    expect(file.contents).toContain('"recent-products": <RecentProductsWidget key={"recent-products"} />,');
    expect(file.contents).toContain("{order.map((id) => widgetElements[id])}");
  });

  it("remembers the dragged order in localStorage, best-effort, and falls back to DEFAULT_WIDGET_ORDER on read failure", () => {
    const file = renderDashboardPage({
      widgets: [{ id: "products-count", type: "stat", title: "Products", resource: productRef }],
    });
    expect(file.contents).toContain('const WIDGET_ORDER_STORAGE_KEY = "quickadui-dashboard-widget-order";');
    expect(file.contents).toContain("function loadWidgetOrder(): string[] {");
    expect(file.contents).toContain("window.localStorage.getItem(WIDGET_ORDER_STORAGE_KEY)");
    expect(file.contents).toContain("window.localStorage.setItem(WIDGET_ORDER_STORAGE_KEY, JSON.stringify(order));");
    expect(file.contents).toContain("return DEFAULT_WIDGET_ORDER;");
  });

  it("dedupes list<Plural> and schema type imports when multiple widgets share a resource", () => {
    const file = renderDashboardPage({
      widgets: [
        { id: "products-count", type: "stat", title: "Products", resource: productRef },
        { id: "recent-products", type: "list", title: "Recent", resource: productRef },
      ],
    });
    const importCount = (file.contents.match(/import \{ listProducts \}/g) ?? []).length;
    expect(importCount).toBe(1);
    const typeImportCount = (file.contents.match(/import type \{ Product \}/g) ?? []).length;
    expect(typeImportCount).toBe(1);
  });

  it("dedupes and sorts the icon import line across multiple widgets", () => {
    const file = renderDashboardPage({
      widgets: [
        { id: "a", type: "stat", title: "A", resource: productRef, icon: "Settings" },
        { id: "b", type: "stat", title: "B", resource: productRef, icon: "Settings" },
        { id: "c", type: "stat", title: "C", resource: todoRef, icon: "Check" },
      ],
    });
    expect(file.contents).toContain('import { CheckIcon, SettingsIcon } from "@quickadui/icons";');
  });
});

describe("renderDashboardPage — widget id sanitization", () => {
  it("produces a valid, quote-safe function name and id attribute for an id containing a double quote", () => {
    const file = renderDashboardPage({
      widgets: [{ id: 'weird"id', type: "stat", title: "Weird", resource: productRef }],
    });
    expect(file.contents).toContain("function WeirdIdWidget()");
    expect(file.contents).toContain('<Widget id={"weird\\"id"}>');
  });

  it("prefixes with an underscore when the id starts with a digit, keeping the identifier valid", () => {
    const file = renderDashboardPage({
      widgets: [{ id: "2024-stats", type: "stat", title: "2024", resource: productRef }],
    });
    expect(file.contents).toContain("function _2024StatsWidget()");
    expect(file.contents).toContain('<_2024StatsWidget key={"2024-stats"} />');
  });

  it("escapes a title containing a double quote safely, both in StatCard's label and the Widget's title prop", () => {
    const file = renderDashboardPage({
      widgets: [{ id: "a", type: "stat", title: 'Say "hi"', resource: productRef }],
    });
    expect(file.contents).toContain('<StatCard label={"Say \\"hi\\""} value={total} />');
  });
});
