# @quickadui/animation

Motion (formerly Framer Motion) presets, reusable animation variants,
and a `Reveal` convenience component — built on the `motion` npm package
(`motion/react`), re-exported from here so consuming code only needs one
dependency.

## What's in here

- **`fadeVariants`**, **`scaleVariants`**, **`slideUpVariants`**,
  **`slideDownVariants`**, **`slideLeftVariants`**,
  **`slideRightVariants`** — plain `Variants` objects, each a
  `hidden`/`visible` pair meant for `initial="hidden" animate="visible"
  exit="hidden"`. Use them directly on your own `motion.div` (or any
  `motion.<tag>`) for full control.
- **`getPresetVariants(preset)`** — the pure lookup from a `RevealPreset`
  name (`"fade"` / `"scale"` / `"slide-up"` / `"slide-down"` /
  `"slide-left"` / `"slide-right"`) to its matching `Variants` object —
  what `Reveal` (below) is built on.
- **`springTransition`**, **`easeTransition`**, **`quickTransition`** —
  ready-made `Transition` objects: a bouncy spring for things the user
  just triggered, a 200ms ease for content that appears on its own, and
  a snappier 120ms ease for small/frequent transitions (hover, tab
  switches).
- **`Reveal`** — a `motion.div` pre-wired with a `preset` and
  `initial`/`animate`/`exit`, for when you don't need to hand-write a
  `motion.div` yourself. Also respects `prefers-reduced-motion` by
  default (`respectReducedMotion`, `true` unless turned off) — when the
  visitor's OS asks for reduced motion, it renders with a zero-duration
  transition instead of animating.
- **`motion`**, **`AnimatePresence`**, **`useReducedMotion`**, and the
  **`Variants`**/**`Transition`**/**`HTMLMotionProps`** types —
  re-exported straight from `motion/react`, so a consumer only needs
  `@quickadui/animation` as a dependency, not `motion` directly.
  `AnimatePresence` is required for any `exit` variant (including
  `Reveal`'s) to actually animate — without wrapping the component whose
  presence toggles in `AnimatePresence`, Motion never gets the chance to
  run an exit animation before the DOM node is removed.

## Usage

```tsx
import { AnimatePresence, Reveal } from "@quickadui/animation";

function Notice({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <Reveal preset="slide-down" className="rounded-md border border-neutral-6 bg-neutral-1 p-4">
          Saved.
        </Reveal>
      )}
    </AnimatePresence>
  );
}
```

```tsx
import { fadeVariants, motion, springTransition } from "@quickadui/animation";

<motion.div variants={fadeVariants} initial="hidden" animate="visible" transition={springTransition} whileHover={{ scale: 1.02 }}>
  Hover me
</motion.div>;
```

## Not wired into `@quickadui/overlays` yet

`Modal`/`Drawer`/`ContextMenu`/`Toast` in `@quickadui/overlays` still
render/unmount instantly, with no enter/exit animation (documented as a
known gap in that package's own README, from before this package
existed). This package makes real animation possible, but actually
wiring `Reveal`/`AnimatePresence` into `overlays`' components is a
separate, deliberately deferred step — see the Projects status doc for
where that stands.

## Important: this package needs its own `@source` if you consume it

`Reveal`'s className default is empty (it's meant to be styled by the
caller via `className`), so this note is mostly forward-looking — but
like every other styled QuickadUI package, if a future version of this
package ever hardcodes Tailwind classes of its own, Tailwind's automatic
content detection still won't see them once pnpm symlinks this package
into `node_modules` (which is `.gitignore`d). Add
`@source "<path-to>/packages/animation/src"` (monorepo) or
`@source "<path-to>/node_modules/@quickadui/animation"` if that ever
applies — see `apps/playground/README.md` for the full explanation.
