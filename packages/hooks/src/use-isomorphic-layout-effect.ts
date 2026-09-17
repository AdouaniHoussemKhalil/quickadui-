import { useEffect, useLayoutEffect } from "react";

/**
 * `useLayoutEffect` in the browser, `useEffect` during SSR. Plain
 * `useLayoutEffect` triggers a React warning when it runs on the server
 * (it never fires there, since there's no layout to measure) — this picks
 * the right one at module-eval time without giving up synchronous
 * pre-paint DOM measurement on the client.
 */
export const useIsomorphicLayoutEffect: typeof useEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;
