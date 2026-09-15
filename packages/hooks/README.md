# @quickadui/hooks

Framework-agnostic React utility hooks with no styling, no Radix dependency,
and no dependency on any other `@quickadui/*` package — safe to pull into
any React 18/19 app on its own, and the foundation several upcoming
QuickadUI packages (forms, layout) build on internally.

## Hooks

### `useIsomorphicLayoutEffect`

`useLayoutEffect` in the browser, `useEffect` during SSR — avoids the React
warning `useLayoutEffect` triggers when it runs on the server, without
giving up synchronous pre-paint DOM measurement on the client. Drop-in
replacement for `useLayoutEffect` anywhere a component might be
server-rendered.

```tsx
import { useIsomorphicLayoutEffect } from "@quickadui/hooks";

function Measured() {
  useIsomorphicLayoutEffect(() => {
    // measure the DOM before paint, safe under SSR
  }, []);
}
```

### `useMediaQuery(query, options?)`

Subscribes to a CSS media query and re-renders when it changes. Built on
`useSyncExternalStore` (not `useState` + `useEffect`), so it's correct
under concurrent rendering and never shows a stale value for one frame
after mount.

```tsx
import { useMediaQuery } from "@quickadui/hooks";

function Responsive() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  return isDesktop ? <DesktopNav /> : <MobileNav />;
}
```

`options.defaultValue` (default `false`) is what's returned before the
query can be evaluated — during SSR, or when `window.matchMedia` isn't
available.

### `useDisclosure(options?)`

Open/close boolean state with stable `open`/`close`/`toggle` callbacks and
matching `onOpen`/`onClose` side effects — the state machine behind a
Dialog/Popover/Drawer trigger, decoupled from any particular overlay
primitive.

```tsx
import { useDisclosure } from "@quickadui/hooks";

function Example() {
  const { isOpen, open, close, toggle } = useDisclosure({ defaultOpen: false });
  return (
    <>
      <button onClick={open}>Open</button>
      {isOpen && <Panel onClose={close} />}
    </>
  );
}
```

Callbacks are referentially stable across renders (`useCallback`), so
passing them into a `useEffect` dependency array or a memoized child
doesn't cause needless re-runs.

### `useDebouncedValue(value, delayMs)`

Returns a copy of `value` that only updates after `delayMs` of no further
changes — e.g. driving a search request off a text input without firing
one per keystroke. The first render always returns `value` itself; there's
no initial delay before the first value is usable.

```tsx
import { useDebouncedValue } from "@quickadui/hooks";

function Search({ query }: { query: string }) {
  const debounced = useDebouncedValue(query, 300);
  // fetch(debounced) in an effect
}
```

### `useControllableState({ value?, defaultValue?, onChange? })`

The controlled/uncontrolled duality every interactive component ends up
needing (`<input value={} onChange={}>` vs `<input defaultValue={}>`) —
Radix's own primitives use the same pattern internally, which is exactly
why `@quickadui/primitives` never needed to expose it directly. QuickadUI's
own stateful components that aren't themselves Radix wrappers use this
instead of reinventing it per component.

```tsx
import { useControllableState } from "@quickadui/hooks";

function useMyToggle(props: { checked?: boolean; onCheckedChange?: (v: boolean) => void }) {
  return useControllableState<boolean>({
    value: props.checked,
    defaultValue: false,
    onChange: props.onCheckedChange,
  });
}
```

Passing `value` (even `false`/`0`, anything not `undefined`) switches the
hook into controlled mode: the caller owns the value, and `setValue` only
calls `onChange` — it does not update what the hook returns until the
caller feeds the new value back in via `value` on the next render.
Whichever mode is active on mount is sticky; switching a component between
controlled and uncontrolled after the fact isn't specially handled, same
as React's own guidance for native form inputs.

## Install

```bash
pnpm add @quickadui/hooks
```

`react` and `react-dom` (`>=18`) are peer dependencies.
