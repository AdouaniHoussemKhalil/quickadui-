# @quickadui/forms

Form field components — `Input`, `Textarea`, `Select`, `Checkbox`,
`Switch`, `RadioGroup`, `Label` — plus a thin `react-hook-form` + Zod
bindings layer (`Form`, `FormField`, `FormItem`, `FormLabel`,
`FormControl`, `FormDescription`, `FormMessage`).

## Field components

All styled wrappers over `@quickadui/primitives`' matching parts (or, for
`Input`/`Textarea`, plain native elements — Radix doesn't have a
text-field primitive, there's nothing to wrap).

- **`Input`** / **`Textarea`** — `inputVariants`/`textareaVariants`
  (`cva`) each expose a `state` variant (`default` / `error`, swapping
  the border/focus-ring color); `Input` additionally has an `inputSize`
  variant (`sm` / `md` / `lg` — named `inputSize`, not `size`, so it
  doesn't collide with the native `<input size>` attribute).
- **`Checkbox`** — wraps `CheckboxRoot`/`CheckboxIndicator`, rendering
  `@quickadui/icons`' `CheckIcon` or `MinusIcon` depending on
  `checked`/`indeterminate`. Known gap: the icon choice only reacts to
  *controlled* `checked` — see the comment in `checkbox.tsx`.
- **`Switch`** — wraps `SwitchRoot`/`SwitchThumb`.
- **`RadioGroup`** / **`RadioGroupItem`** — wraps
  `RadioGroupRoot`/`RadioGroupItem`/`RadioGroupIndicator`.
- **`Select`** / **`SelectTrigger`** / **`SelectValue`** /
  **`SelectContent`** / **`SelectGroup`** / **`SelectLabel`** /
  **`SelectItem`** / **`SelectSeparator`** — wraps the full Radix Select
  part set (via `@quickadui/primitives`), using "popper" positioning so
  the dropdown matches the trigger's width.
- **`Label`** — wraps `Label` from primitives; mostly useful on its own
  for a field that isn't wired into `<Form>` (see below) — inside a
  `<Form>`, prefer `FormLabel`, which also gets the right `htmlFor` and
  error-state styling for free.

## The `Form` layer: wiring `react-hook-form` + Zod to the fields above

None of the field components above know anything about
`react-hook-form` — they're plain controlled/uncontrolled inputs. This
layer (closely following the shadcn/ui `Form` pattern, built on the same
Radix `Slot` primitives) is what connects one to a form without every
field component needing to.

- **`Form`** — literally `react-hook-form`'s own `FormProvider`,
  re-exported under this name so you only ever import from
  `@quickadui/forms`.
- **`FormField`** — wraps `react-hook-form`'s `Controller`, recording the
  field's `name` in context.
- **`FormItem`** — a `grid gap-2` wrapper; generates the id every other
  part below derives its own id from.
- **`FormLabel`** — a `Label` that already has the right `htmlFor` and
  switches to the danger color when the field has an error.
- **`FormControl`** — merges the generated `id`/`aria-describedby`/
  `aria-invalid` onto its single child via `Slot` — put `Input`/
  `Select`/`Checkbox`/... directly inside it.
- **`FormDescription`** — helper text, wired to `aria-describedby`.
- **`FormMessage`** — renders the field's validation error (falls back to
  `children` when there isn't one, and renders nothing when there's
  neither).
- **`useFormField`** — the hook the parts above are built on, exported in
  case a fully custom field layout needs the same ids/error state.

`zodResolver` (from `@hookform/resolvers/zod`) and `useForm`/
`useFormContext`/`Controller` (from `react-hook-form` itself) are
re-exported too, so a consumer app only needs `zod` as a direct
dependency of its own — not `react-hook-form` or `@hookform/resolvers`.
`zod` is a peer dependency here (`peerDependenciesMeta.zod.optional`,
matching how `@hookform/resolvers` itself treats every validator library
it supports) — this package's own code never imports it, only
`@hookform/resolvers/zod`, whose types reference it generically.

## Usage

```tsx
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  useForm,
  zodResolver,
} from "@quickadui/forms";
import { Button } from "@quickadui/core";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
});
interface SignupValues {
  email: string;
}

function SignupForm() {
  const form = useForm<SignupValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => console.log(values))}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormDescription>We'll never share your email.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Sign up</Button>
      </form>
    </Form>
  );
}
```

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@quickadui/forms";

<Select defaultValue="member">
  <SelectTrigger>
    <SelectValue placeholder="Pick a role" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="member">Member</SelectItem>
    <SelectItem value="admin">Admin</SelectItem>
  </SelectContent>
</Select>;
```

## Important: this package needs its own `@source` if you consume it

Like `@quickadui/core`/`@quickadui/layout`/`@quickadui/overlays`, this
package's classes live only in its own compiled output, invisible to
Tailwind's automatic content detection once pnpm symlinks it into
`node_modules` (which is `.gitignore`d). Add
`@source "<path-to>/packages/forms/src"` (monorepo) or
`@source "<path-to>/node_modules/@quickadui/forms"` to your CSS entry
file — see `apps/playground/README.md` for the full explanation.
