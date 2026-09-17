/**
 * Flattens an intersection type into a single object type for cleaner
 * hover tooltips/autocomplete — `AsChildProps & ComponentProps<"button">`
 * reads as one merged object in an editor instead of the intersection
 * itself. Purely a DX aid: `T` and `Prettify<T>` are structurally
 * identical, so this changes nothing about what's assignable at runtime or
 * compile time.
 */
// The trailing `& {}` is intentional, not accidental — it's what forces
// TypeScript to eagerly flatten the mapped type into a plain object shape
// in hover tooltips. Removing it would defeat the only reason this helper
// exists. (Biome's `noBannedTypes` doesn't flag `{}` used this way, inside
// an intersection with a mapped type — only a bare standalone `{}`.)
export type Prettify<T> = { [K in keyof T]: T[K] } & {};
