import { Component, act, type ReactElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getThemeScript } from "./dom";
import { ThemeProvider, ThemeScript, useTheme } from "./theme-provider";

const STORAGE_KEY = "quickadui-theme";

interface FakeMediaQueryList {
  matches: boolean;
  media: string;
  addEventListener(type: "change", listener: (event: { matches: boolean }) => void): void;
  removeEventListener(type: "change", listener: (event: { matches: boolean }) => void): void;
}

/**
 * jsdom does not implement `matchMedia` at all, but `ThemeProvider` needs it
 * to resolve/track "system" mode — this is a minimal fake supporting just
 * what `dom.ts` actually calls: reading `.matches` and subscribing via
 * `addEventListener("change", ...)`, with a `setMatches` escape hatch so
 * tests can simulate the OS preference changing live.
 */
function mockMatchMedia(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<(event: { matches: boolean }) => void>();
  const mql: FakeMediaQueryList = {
    get matches() {
      return matches;
    },
    media: "(prefers-color-scheme: dark)",
    addEventListener: (_type, listener) => {
      listeners.add(listener);
    },
    removeEventListener: (_type, listener) => {
      listeners.delete(listener);
    },
  };
  vi.stubGlobal("matchMedia", (_query: string) => mql as unknown as MediaQueryList);
  return {
    setMatches(next: boolean) {
      matches = next;
      for (const listener of listeners) listener({ matches: next });
    },
  };
}

function Consumer() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button type="button" onClick={() => setTheme("dark")}>
        dark
      </button>
      <button type="button" onClick={() => setTheme("light")}>
        light
      </button>
      <button type="button" onClick={() => setTheme("system")}>
        system
      </button>
    </div>
  );
}

interface CatchErrorState {
  message: string | null;
}

/** Turns the render-time throw from `useTheme()` into DOM text we can assert on, regardless of whether a bare `root.render` would also throw synchronously. */
class CatchError extends Component<{ children: ReactNode }, CatchErrorState> {
  state: CatchErrorState = { message: null };

  static getDerivedStateFromError(error: unknown): CatchErrorState {
    return { message: error instanceof Error ? error.message : String(error) };
  }

  override render() {
    if (this.state.message !== null) {
      return <span data-testid="error">{this.state.message}</span>;
    }
    return this.props.children;
  }
}

let container: HTMLDivElement;
let root: Root;

function renderWithAct(ui: ReactElement) {
  act(() => {
    root.render(ui);
  });
}

function click(button: Element | null | undefined) {
  act(() => {
    button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("useTheme", () => {
  it("throws a clear error when used outside a <ThemeProvider>", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    renderWithAct(
      <CatchError>
        <Consumer />
      </CatchError>,
    );
    expect(container.querySelector('[data-testid="error"]')?.textContent).toMatch(
      /useTheme\(\) must be used within a <ThemeProvider>/,
    );
    spy.mockRestore();
  });
});

describe("ThemeProvider", () => {
  it('defaults to "system" and resolves it via matchMedia when nothing is stored', () => {
    mockMatchMedia(true); // OS says dark
    renderWithAct(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );
    expect(container.querySelector('[data-testid="theme"]')?.textContent).toBe("system");
    expect(container.querySelector('[data-testid="resolved"]')?.textContent).toBe("dark");
    // "system" removes the attribute so plain CSS prefers-color-scheme takes over
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
  });

  it("initializes from localStorage rather than defaultTheme, matching what the inline ThemeScript already painted", () => {
    localStorage.setItem(STORAGE_KEY, "dark");
    mockMatchMedia(false);
    renderWithAct(
      <ThemeProvider defaultTheme="light">
        <Consumer />
      </ThemeProvider>,
    );
    expect(container.querySelector('[data-testid="theme"]')?.textContent).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("falls back to defaultTheme when nothing is stored", () => {
    mockMatchMedia(false);
    renderWithAct(
      <ThemeProvider defaultTheme="light">
        <Consumer />
      </ThemeProvider>,
    );
    expect(container.querySelector('[data-testid="theme"]')?.textContent).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("setTheme updates the DOM attribute, persists to localStorage, and re-renders", () => {
    mockMatchMedia(false);
    renderWithAct(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );
    click(container.querySelectorAll("button")[0]); // "dark"
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("dark");
    expect(container.querySelector('[data-testid="theme"]')?.textContent).toBe("dark");
    expect(container.querySelector('[data-testid="resolved"]')?.textContent).toBe("dark");
  });

  it('switching back to "system" removes the attribute again', () => {
    mockMatchMedia(false);
    renderWithAct(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );
    const buttons = container.querySelectorAll("button");
    click(buttons[0]); // dark
    click(buttons[2]); // system
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
    expect(container.querySelector('[data-testid="theme"]')?.textContent).toBe("system");
  });

  it('tracks OS preference changes live while in "system" mode', () => {
    const media = mockMatchMedia(false);
    renderWithAct(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );
    expect(container.querySelector('[data-testid="resolved"]')?.textContent).toBe("light");
    act(() => {
      media.setMatches(true);
    });
    expect(container.querySelector('[data-testid="resolved"]')?.textContent).toBe("dark");
  });

  it('ignores OS preference changes once a mode other than "system" is chosen', () => {
    const media = mockMatchMedia(false);
    renderWithAct(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );
    click(container.querySelectorAll("button")[1]); // explicit "light"
    act(() => {
      media.setMatches(true); // OS flips to dark — should have no effect now
    });
    expect(container.querySelector('[data-testid="theme"]')?.textContent).toBe("light");
    expect(container.querySelector('[data-testid="resolved"]')?.textContent).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("scopes safely to environments without matchMedia (no crash)", () => {
    vi.stubGlobal("matchMedia", undefined);
    expect(() => {
      renderWithAct(
        <ThemeProvider>
          <Consumer />
        </ThemeProvider>,
      );
    }).not.toThrow();
    expect(container.querySelector('[data-testid="resolved"]')?.textContent).toBe("light");
  });
});

describe("ThemeScript", () => {
  it("renders a <script> tag whose content is exactly getThemeScript(storageKey)", () => {
    renderWithAct(<ThemeScript storageKey={STORAGE_KEY} />);
    const script = container.querySelector("script");
    expect(script).not.toBeNull();
    expect(script?.textContent).toBe(getThemeScript(STORAGE_KEY));
  });

  it('defaults storageKey to "quickadui-theme"', () => {
    renderWithAct(<ThemeScript />);
    const script = container.querySelector("script");
    expect(script?.textContent).toBe(getThemeScript());
  });
});
