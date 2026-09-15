/**
 * Flattens an intersection type into a single object type for cleaner
 * hover tooltips/autocomplete — `AsChildProps & ComponentProps<"button">`
 * reads as one merged object in an editor instead of the intersection
 * itself. Purely a DX aid: `T` and `Prettify<T>` are structurally
 * identical, so this changes nothing about what's assignable at runtime or
 * compile time.
 */
export type Prettify<T> = { [K in keyof T]: T[K] } & {};
