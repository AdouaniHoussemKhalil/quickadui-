import type { ReactNode } from "react";

export interface ExampleProps {
  children: ReactNode;
  /**
   * Optional read-only source snippet shown below the live preview.
   * Static text only, not a live/editable playground — Sandpack is
   * explicitly deferred past this MVP, see the project status doc.
   */
  code?: string;
}

/** A live-rendered example of a real `@quickadui/*` component, optionally paired with its static source underneath. */
export function Example({ children, code }: ExampleProps) {
  return (
    <div className="mb-6 overflow-hidden rounded-lg border border-neutral-6">
      <div className="flex flex-wrap items-center gap-3 bg-neutral-2 p-6">{children}</div>
      {code === undefined ? null : (
        <pre className="overflow-x-auto border-t border-neutral-6 bg-neutral-1 p-4 text-sm">
          <code className="font-mono text-neutral-12">{code}</code>
        </pre>
      )}
    </div>
  );
}
