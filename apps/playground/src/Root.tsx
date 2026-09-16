import { useEffect, useState } from "react";
import { App } from "./App";
import { DashboardDemo } from "./DashboardDemo";

/**
 * The playground deliberately has no router dependency — adding
 * `react-router-dom` would be one more package this sandbox can't
 * validate against real types with no npm registry access, for a
 * throwaway demo app that doesn't need real routing. This is the
 * smallest thing that works: read `location.hash`, re-render on
 * `hashchange`. `#dashboard` shows `DashboardDemo`, anything else
 * (including no hash) shows the main component playground.
 */
function useHashRoute(): string {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  return hash;
}

export function Root() {
  const hash = useHashRoute();
  return hash === "#dashboard" ? <DashboardDemo /> : <App />;
}
