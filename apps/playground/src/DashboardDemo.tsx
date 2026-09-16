import { BarChart, DonutChart, LineChart, Sparkline, StatCard } from "@quickadui/charts";
import { Alert, AlertDescription, AlertTitle, Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Typography } from "@quickadui/core";
import { ClockIcon, CircleIcon, SettingsIcon, UserIcon } from "@quickadui/icons";
import {
  DashboardLayout,
  Footer,
  Navbar,
  NavbarActions,
  NavbarBrand,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarNavItem,
  SidebarTrigger,
  Widget,
  WidgetGrid,
} from "@quickadui/shell";
import { useState, type ReactNode } from "react";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: <CircleIcon size={18} /> },
  { id: "team", label: "Team", icon: <UserIcon size={18} /> },
  { id: "activity", label: "Activity", icon: <ClockIcon size={18} /> },
  { id: "settings", label: "Settings", icon: <SettingsIcon size={18} /> },
] as const satisfies readonly { id: string; label: string; icon: ReactNode }[];

/** Real `@quickadui/shell` `SidebarNavItem`s, wired to real local state — `href="#dashboard"` keeps this app's own hash router (see `Root.tsx`) on the dashboard page, `preventDefault` stops the anchor from actually navigating. */
function DashboardSidebar() {
  const [activeId, setActiveId] = useState<string>("overview");

  return (
    <Sidebar>
      <SidebarHeader>
        <Typography variant="small" className="font-semibold text-neutral-12">
          QuickadUI
        </Typography>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          {NAV_ITEMS.map((item) => (
            <SidebarNavItem
              key={item.id}
              href="#dashboard"
              icon={item.icon}
              active={activeId === item.id}
              onClick={(event: { preventDefault: () => void }) => {
                // Structurally typed instead of React's real
                // `MouseEvent<HTMLAnchorElement>` — same local react-stub
                // limitation documented in `@quickadui/shell`'s own
                // `sidebar.tsx` (`SidebarTrigger`'s onClick): the stub's
                // `ComponentProps<T>` falls back to `Record<string, any>`
                // for any plain tag name, so `SidebarNavItemProps`'
                // `onClick` (inherited from `ComponentProps<"a">`) has no
                // real function signature to infer this parameter's type
                // from.
                event.preventDefault();
                setActiveId(item.id);
              }}
            >
              {item.label}
            </SidebarNavItem>
          ))}
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Typography variant="muted" className="text-xs">
          v0.0.0
        </Typography>
      </SidebarFooter>
    </Sidebar>
  );
}

const PLACEHOLDER_STATS = [
  {
    id: "active-users",
    label: "Active users",
    value: "2,431",
    trend: { direction: "up", label: "+8.2%" },
    spark: [180, 190, 175, 210, 205, 230, 240, 251],
  },
  {
    id: "revenue",
    label: "Revenue (MTD)",
    value: "$18,204",
    trend: { direction: "up", label: "+12.4%" },
    spark: [12000, 12600, 12100, 13800, 14900, 15600, 17200, 18204],
  },
  {
    id: "tickets",
    label: "Open tickets",
    value: "12",
    trend: { direction: "down", label: "-4" },
    spark: [22, 20, 19, 17, 16, 15, 13, 12],
  },
  {
    id: "uptime",
    label: "Uptime",
    value: "99.98%",
    trend: { direction: "up", label: "+0.02%" },
    spark: [99.9, 99.92, 99.91, 99.95, 99.96, 99.94, 99.97, 99.98],
  },
] as const satisfies readonly {
  id: string;
  label: string;
  value: string;
  trend: { direction: "up" | "down"; label: string };
  spark: readonly number[];
}[];

const STATS_BY_ID: Map<string, (typeof PLACEHOLDER_STATS)[number]> = new Map(PLACEHOLDER_STATS.map((stat) => [stat.id, stat]));

const REVENUE_TREND = [
  { month: "Jan", revenue: 4200 },
  { month: "Feb", revenue: 4800 },
  { month: "Mar", revenue: 4100 },
  { month: "Apr", revenue: 5300 },
  { month: "May", revenue: 6100 },
  { month: "Jun", revenue: 5800 },
  { month: "Jul", revenue: 6600 },
  { month: "Aug", revenue: 7200 },
] as const satisfies readonly Record<string, string | number>[];

const SIGNUPS_BY_PLAN = [
  { plan: "Free", signups: 120, churned: 8 },
  { plan: "Pro", signups: 64, churned: 3 },
  { plan: "Team", signups: 21, churned: 1 },
  { plan: "Enterprise", signups: 6, churned: 0 },
] as const satisfies readonly Record<string, string | number>[];

const TICKET_STATUS = [
  { key: "open", label: "Open", value: 12 },
  { key: "pending", label: "Pending", value: 5 },
  { key: "resolved", label: "Resolved", value: 34 },
] as const;

/**
 * A full example page built entirely from `@quickadui/shell`'s real
 * components — same standard as `App.tsx`: nothing here is faked or
 * mocked up ahead of the real package existing. `DashboardLayout`/
 * `Navbar`/`Sidebar`/`Footer` are Phase 1 (the static shell); the stat
 * cards below are real Phase 2 `Widget`s inside a real `WidgetGrid` —
 * drag one by its handle (or focus it and use the arrow keys) to reorder
 * it, which calls `WidgetGrid`'s `onReorder` and updates `statOrder`
 * below, a plain local `useState` — `@quickadui/shell` itself owns none
 * of the order, same as everywhere else in this package.
 */
const CHART_WIDGET_IDS = ["revenue-trend", "signups-by-plan", "ticket-status"] as const;

export function DashboardDemo() {
  const [statOrder, setStatOrder] = useState<string[]>(() => PLACEHOLDER_STATS.map((stat) => stat.id));
  const [chartOrder, setChartOrder] = useState<string[]>(() => [...CHART_WIDGET_IDS]);

  return (
    <DashboardLayout
      navbar={
        <Navbar>
          <SidebarTrigger />
          <NavbarBrand>QuickadUI</NavbarBrand>
          <NavbarActions>
            <a href="#" className="text-sm text-neutral-11 hover:text-neutral-12">
              &larr; Back to component playground
            </a>
          </NavbarActions>
        </Navbar>
      }
      sidebar={<DashboardSidebar />}
      footer={
        <Footer>
          <span>&copy; QuickadUI</span>
          <span>@quickadui/shell + @quickadui/charts demo</span>
        </Footer>
      }
    >
      <Alert variant="success" className="mb-6">
        <AlertTitle>Real dashboard widgets, real charts, real drag-and-drop</AlertTitle>
        <AlertDescription>
          This page is built entirely from two real, published packages: <code>@quickadui/shell</code>'s
          <code>DashboardLayout</code>/<code>Navbar</code>/<code>Sidebar</code>/<code>Footer</code>/<code>WidgetGrid</code>/
          <code>Widget</code> (drag-and-drop via <code>@dnd-kit</code>), and <code>@quickadui/charts</code>'
          <code>StatCard</code>/<code>Sparkline</code>/<code>LineChart</code>/<code>BarChart</code>/<code>DonutChart</code> —
          hand-rolled SVG, no charting-library dependency. Every number below is fake, every pixel rendering it is real. Grab a
          widget by its handle to reorder it, or hover/tab into a chart for its tooltip.
        </AlertDescription>
      </Alert>

      <WidgetGrid items={statOrder} onReorder={setStatOrder} columns={4} className="mb-6">
        {statOrder.map((id) => {
          const stat = STATS_BY_ID.get(id);
          if (!stat) {
            return null;
          }
          return (
            <Widget key={id} id={id}>
              <StatCard label={stat.label} value={stat.value} trend={stat.trend}>
                <Sparkline data={stat.spark} area />
              </StatCard>
            </Widget>
          );
        })}
      </WidgetGrid>

      <WidgetGrid items={chartOrder} onReorder={setChartOrder} columns={3} className="mb-6">
        {chartOrder.map((id) => {
          if (id === "revenue-trend") {
            return (
              <Widget key={id} id={id} title="Revenue trend">
                <LineChart
                  data={REVENUE_TREND}
                  categoryKey="month"
                  series={[{ key: "revenue", label: "Revenue" }]}
                  area
                  valueFormatter={(value) => `$${Math.round(value / 1000)}k`}
                />
              </Widget>
            );
          }
          if (id === "signups-by-plan") {
            return (
              <Widget key={id} id={id} title="Signups by plan">
                <BarChart
                  data={SIGNUPS_BY_PLAN}
                  categoryKey="plan"
                  series={[
                    { key: "signups", label: "Signups" },
                    { key: "churned", label: "Churned" },
                  ]}
                />
              </Widget>
            );
          }
          if (id === "ticket-status") {
            return (
              <Widget key={id} id={id} title="Ticket status">
                <DonutChart data={TICKET_STATUS} />
              </Widget>
            );
          }
          return null;
        })}
      </WidgetGrid>

      <Card>
        <CardHeader>
          <CardTitle>Try the sidebar too</CardTitle>
          <CardDescription>
            Click the menu icon in the navbar (top-left) to collapse the sidebar to icons only, or click a nav item below it to
            see the active state change.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="soft">Real SidebarProvider state — try resizing the window too, nothing here is faked</Badge>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
