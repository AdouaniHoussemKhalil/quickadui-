---
"create-quickadui": patch
---

Fix a generated dashboard bug: "stat" widgets (e.g. a Products or Todos count) rendered inside a `Widget` with no `title`, leaving an empty, floating header (just the drag handle, full padding and border) above the `StatCard` — visually disconnected from the content below and inconsistent with "list" widgets, which already set the `Widget`'s `title`.

`renderStatWidget` (in `packages/cli/src/generate/dashboard-templates.ts`) now passes the widget's `title` to `<Widget>`, matching `renderListWidget`'s existing pattern. Re-run `quickadui apply --force` (or `quickadui generate` your dashboard again) to regenerate `DashboardPage.tsx` with the fix.
