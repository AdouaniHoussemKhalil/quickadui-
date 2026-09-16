"use client";

import { Slot } from "@quickadui/primitives";
import { cn } from "@quickadui/utils";
import type { ComponentProps } from "react";
import { createContext, useContext, useId } from "react";
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  useFormContext,
  useFormState,
} from "react-hook-form";
import { Label } from "./label";

/**
 * Re-exported under QuickadUI's own name so consumers only ever import
 * from `@quickadui/forms` — same "don't let consumers reach past this
 * package to the underlying vendor" convention `@quickadui/primitives`
 * applies to Radix (see its README). `Form` *is* `react-hook-form`'s own
 * `FormProvider`: there's no QuickadUI-specific behavior to add at this
 * level, only a stable name and import path.
 */
export const Form = FormProvider;

interface FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

/**
 * Wraps `react-hook-form`'s `Controller`, additionally recording the
 * field's `name` in context so `FormLabel`/`FormControl`/
 * `FormDescription`/`FormMessage` underneath it can wire up the right
 * `id`/`aria-*` attributes and read the right field's error without the
 * caller repeating the field name at every level — the same pattern
 * shadcn/ui's `Form` uses, built on the same primitives.
 */
export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

interface FormItemContextValue {
  id: string;
}

const FormItemContext = createContext<FormItemContextValue | null>(null);

/**
 * The one piece of real, non-trivial logic in this file: reads the
 * nearest `FormField`'s name and `FormItem`'s generated id out of
 * context, combines them with `useFormState`'s error map via
 * `getFieldState`, and returns every id/error the parts below need — so
 * each of them stays a one-line function. Not covered by a unit test
 * (unlike `overlays`' `toast-store.ts`): it reads two React contexts and
 * a form-state hook, so exercising it means rendering a real
 * `<Form>`/`<FormField>`/`<FormItem>` tree with React Testing Library,
 * not a plain function call — same reasoning that's kept every other
 * context-driven component in this monorepo test-free so far.
 */
export function useFormField() {
  const fieldContext = useContext(FormFieldContext);
  const itemContext = useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  // Passed conditionally, not `useFormState({ name: fieldContext?.name })`
  // — react-hook-form's real `name` option is `string | string[] |
  // readonly string[]` with no `undefined` in the type itself (only the
  // property is optional), so handing it `undefined` explicitly is a real
  // `exactOptionalPropertyTypes` violation, same shape as `overlays`'
  // `toaster.tsx` `duration` fix. `useFormField` throws just below when
  // `fieldContext` is missing anyway, so `formState` is never actually
  // used in that case.
  const formState = useFormState(fieldContext ? { name: fieldContext.name } : undefined);

  if (!fieldContext) {
    throw new Error("useFormField must be used within a <FormField>");
  }
  if (!itemContext) {
    throw new Error("useFormField must be used within a <FormItem>");
  }

  const fieldState = getFieldState(fieldContext.name, formState);
  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
}

export function FormItem({ className, ...props }: ComponentProps<"div">) {
  const id = useId();
  return (
    <FormItemContext.Provider value={{ id }}>
      <div data-slot="form-item" className={cn("grid gap-2", className)} {...props} />
    </FormItemContext.Provider>
  );
}

export function FormLabel({ className, ...props }: ComponentProps<typeof Label>) {
  const { error, formItemId } = useFormField();
  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-danger-11", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}

/**
 * Merges the generated `id`/`aria-*` attributes onto whatever single form
 * control is passed as `children`, via `Slot` (the same mechanism
 * `Button`'s `asChild` uses) instead of rendering a DOM node of its own —
 * `Input`/`Select`/`Checkbox`/`Switch`/`RadioGroup` all stay completely
 * unaware that a `Form` is involved.
 */
export function FormControl(props: ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={!error ? formDescriptionId : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      {...props}
    />
  );
}

export function FormDescription({ className, ...props }: ComponentProps<"p">) {
  const { formDescriptionId } = useFormField();
  return <p data-slot="form-description" id={formDescriptionId} className={cn("text-sm text-neutral-11", className)} {...props} />;
}

export function FormMessage({ className, children, ...props }: ComponentProps<"p">) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error.message ?? "") : children;
  if (!body) {
    return null;
  }
  return (
    <p data-slot="form-message" id={formMessageId} className={cn("text-sm font-medium text-danger-11", className)} {...props}>
      {body}
    </p>
  );
}
