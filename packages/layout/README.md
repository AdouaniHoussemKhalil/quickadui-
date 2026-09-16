# @quickadui/layout

Layout building blocks — no behavior, no Radix dependency, just `cva`
variants over plain HTML elements plus `@quickadui/utils`'s `cn()`.

## What's in here

- **`Flex`** — the general-purpose flexbox primitive. `direction` /
  `align` / `justify` / `wrap` / `gap`, all independent.
- **`Stack`** — sugar over the same primitive as `Flex`, defaulting to
  `direction: "column"` and `gap: "md"` instead of `Flex`'s horizontal,
  gap-less defaults — for the common "things, spaced out, one under the
  other" case. Only exposes `direction` / `align` / `gap`; reach for
  `Flex` directly for `justify`/`wrap`.
- **`Grid`** — `columns` (`1`/`2`/`3`/`4`/`6`/`12`) and `gap`. `columns`
  is a fixed set, not an arbitrary number, because the corresponding
  Tailwind class (`grid-cols-6`, say) has to exist ahead of time for
  Tailwind's scanner to generate it — see `gap` below and
  `apps/playground/README.md`'s `@source` section for why that matters.
  A grid that genuinely needs a column count outside this set can use
  `className="grid-cols-[7]"` directly.
- **`Container`** — centers content and caps its width. `maxWidth`:
  `sm` (`max-w-3xl`) / `md` (`max-w-5xl`) / `lg` (`max-w-6xl`) / `xl`
  (`max-w-7xl`, the default) / `full` (`max-w-none`). Deliberately uses
  Tailwind's fixed rem-based `max-w-*` scale rather than the
  `max-w-screen-*` one, which is tied to the `screens` theme key this
  project doesn't customize.
- **`Section`** — a real `<section>` (not a `<div>` — it's meant to mark
  an actual document section) with vertical rhythm baked in via
  `spacing`: `sm` (`py-8`) / `md` (`py-12`, the default) / `lg` (`py-16`)
  / `xl` (`py-24`). Independent of `Container` — nest a `Container`
  inside a `Section` for both vertical rhythm and a capped, centered
  width.

`Flex`, `Stack`, and `Grid` all share the exact same `gap` scale:
`none` (`gap-0`) / `xs` (`gap-1`) / `sm` (`gap-2`) / `md` (`gap-4`,
`Stack`/`Grid`'s default) / `lg` (`gap-6`) / `xl` (`gap-8`) / `2xl`
(`gap-12`) — deliberately, so switching a block of markup between
`Stack` and `Grid` doesn't also mean re-picking a gap value.

## Usage

```tsx
import { Container, Section, Stack, Grid, Flex } from "@quickadui/layout";

function Page() {
  return (
    <Section spacing="lg">
      <Container maxWidth="lg">
        <Stack gap="lg">
          <Flex justify="between" align="center">
            <h1>Title</h1>
            <button>Action</button>
          </Flex>
          <Grid columns="3" gap="md">
            <div>Card 1</div>
            <div>Card 2</div>
            <div>Card 3</div>
          </Grid>
        </Stack>
      </Container>
    </Section>
  );
}
```

## Every component

- forwards `className` through `cn()` so a caller's override always wins;
- sets a stable `data-slot="..."` attribute matching its name;
- forwards every other native prop it doesn't otherwise use.

`Flex`, `Stack`, and `Grid` additionally accept `as` (e.g. `as="header"`,
`as="ul"`) to render a different element than their `<div>` default —
same `as` pattern `@quickadui/core`'s `Typography` already uses, and the
same tradeoff: props stay typed against `<div>`'s regardless of what
`as` is actually set to. `Section` doesn't need this — it already
renders a real `<section>`, not a `<div>`.
