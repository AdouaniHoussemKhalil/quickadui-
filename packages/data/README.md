# @quickadui/data

Table, Pagination, Timeline, Tree View, and Stepper — data-display and
multi-step navigation components. None of these wrap a Radix primitive
(Radix doesn't have equivalents for any of them) — they're plain React
built with `class-variance-authority` and `@quickadui/utils`' `cn()`,
same spirit as `@quickadui/layout`.

> Tabs/Accordion, mentioned in this package's original scaffold
> description, ship in `@quickadui/core` instead (built on
> `@quickadui/primitives`' Radix wrappers) — see its README. A
> sortable/filterable/virtualized **Data Grid** is explicitly out of
> scope here: it's a different, much larger kind of component (column
> management, virtualization for large datasets, cell editing) that
> deserves its own design rather than being bolted onto `Table`. `Table`
> below is the plain semantic kind — you bring your own sorting/filtering
> state if you need it.

## What's in here

- **`Table`** / **`TableHeader`** / **`TableBody`** / **`TableFooter`** /
  **`TableRow`** / **`TableHead`** / **`TableCell`** / **`TableCaption`**
  — styled wrappers over the native `<table>` elements (no ARIA needed
  beyond what the browser already gives a real table). `Table` wraps
  itself in a horizontally-scrollable container. `TableRow` takes a
  `selected?: boolean` prop.
- **`Pagination`** / **`PaginationContent`** / **`PaginationItem`** /
  **`PaginationLink`** (`isActive?: boolean`) / **`PaginationPrevious`** /
  **`PaginationNext`** / **`PaginationEllipsis`** — the rendered parts,
  plus **`getPaginationRange(currentPage, totalPages, siblingCount?)`**,
  a pure function computing which page numbers (and where to collapse a
  run of skipped pages into a single ellipsis) a pagination control
  should show — the actual hard part of building pagination UI. None of
  the components call it for you (there's no one-size-fits-all page-click
  handler to bake in) — see the usage example below for how they compose.
  `PaginationPrevious`/`PaginationNext` are icon-only (a chevron, no
  hardcoded "Previous"/"Next" text) so a consuming app isn't stuck with
  an English word regardless of its own locale — pass your own
  `aria-label` to translate/override the default ("Go to previous/next
  page"), which is what's actually announced to assistive tech.
- **`Stepper`** (`value`: 0-based current-step index, `orientation`) /
  **`StepperItem`** (`step`: this item's own 0-based index) /
  **`StepperIndicator`** (renders a check mark once complete, otherwise
  its `children` — typically the step number) / **`StepperTitle`** /
  **`StepperDescription`** / **`StepperSeparator`** (`step`: the index of
  the step *before* it — colors itself once that step is done). Each
  part derives its own visual state from `Stepper`'s `value` plus its own
  `step` index via the exported pure `getStepStatus(step, currentValue)`
  — `StepperSeparator` needs its own `step` prop rather than reading a
  neighboring `StepperItem`'s status via CSS, because it's a *sibling* of
  the items it sits between, not a descendant, so `group-data-*`
  selectors can't reach across to it.
- **`Timeline`** / **`TimelineItem`** / **`TimelineSeparator`** (the
  dot-and-line column) / **`TimelineDot`** (`variant`: default / accent /
  success / warning / danger) / **`TimelineConnector`** (the vertical
  line between dots) / **`TimelineContent`**.
- **`TreeView`** / **`TreeViewItem`** (`nodeId`, `label`, optional
  `icon`, nested `TreeViewItem`s as `children`) — a recursive expandable
  tree with `role="tree"`/`"treeitem"`/`aria-expanded`/`aria-selected`.
  Expansion state is uncontrolled by default (`defaultExpandedIds`) or
  fully controlled (`expandedIds` + `onExpandedIdsChange`) — both drive
  the same exported pure **`toggleExpanded(expandedIds, id)`**, which
  returns a new `Set` with that one id flipped in or out, without
  mutating the one it was given.

## Usage

```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@quickadui/data";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Role</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow selected>
      <TableCell>Ada Lovelace</TableCell>
      <TableCell>Admin</TableCell>
    </TableRow>
  </TableBody>
</Table>;
```

```tsx
import {
  getPaginationRange,
  PAGINATION_ELLIPSIS,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@quickadui/data";

function MyPagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (page: number) => void }) {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious onClick={() => onPageChange(page - 1)} disabled={page <= 1} />
        </PaginationItem>
        {getPaginationRange(page, totalPages).map((item, index) =>
          item === PAGINATION_ELLIPSIS ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink isActive={item === page} onClick={() => onPageChange(item)}>
                {item}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
```

```tsx
import { Stepper, StepperDescription, StepperIndicator, StepperItem, StepperSeparator, StepperTitle } from "@quickadui/data";

<Stepper value={1}>
  <StepperItem step={0}>
    <StepperIndicator>1</StepperIndicator>
    <StepperTitle>Account</StepperTitle>
  </StepperItem>
  <StepperSeparator step={0} />
  <StepperItem step={1}>
    <StepperIndicator>2</StepperIndicator>
    <StepperTitle>Profile</StepperTitle>
    <StepperDescription>Add a photo and bio</StepperDescription>
  </StepperItem>
  <StepperSeparator step={1} />
  <StepperItem step={2}>
    <StepperIndicator>3</StepperIndicator>
    <StepperTitle>Confirm</StepperTitle>
  </StepperItem>
</Stepper>;
```

```tsx
import { TreeView, TreeViewItem } from "@quickadui/data";

<TreeView defaultExpandedIds={["src"]} onSelect={(id) => console.log("selected", id)}>
  <TreeViewItem nodeId="src" label="src">
    <TreeViewItem nodeId="src/index.ts" label="index.ts" />
    <TreeViewItem nodeId="src/app.tsx" label="app.tsx" />
  </TreeViewItem>
  <TreeViewItem nodeId="package.json" label="package.json" />
</TreeView>;
```

## Important: this package needs its own `@source` if you consume it

Like `@quickadui/core`/`@quickadui/layout`/`@quickadui/overlays`/
`@quickadui/forms`, this package's classes live only in its own compiled
output, invisible to Tailwind's automatic content detection once pnpm
symlinks it into `node_modules` (which is `.gitignore`d). Add
`@source "<path-to>/packages/data/src"` (monorepo) or
`@source "<path-to>/node_modules/@quickadui/data"` to your CSS entry
file — see `apps/playground/README.md` for the full explanation.
