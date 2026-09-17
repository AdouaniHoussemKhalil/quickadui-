import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@quickadui/data";

export interface PropRow {
  name: string;
  type: string;
  /** Omit for a required prop with no useful default to show. */
  default?: string;
  description: string;
}

export interface PropsTableProps {
  rows: PropRow[];
}

/**
 * A hand-written prop table — see the project status doc's MVP scope
 * decision: generation from real TS source is deferred to a later round,
 * once the docs structure is proven out. Rendered with the real
 * `@quickadui/data` `Table` (not a raw markdown table) so the docs site
 * keeps dogfooding its own components, same principle `<Example>` follows
 * for live component previews.
 */
export function PropsTable({ rows }: PropsTableProps) {
  return (
    <div className="mb-6 overflow-hidden rounded-lg border border-neutral-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Prop</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Default</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.name}>
              <TableCell>
                <code className="font-mono text-xs text-accent-11">{row.name}</code>
              </TableCell>
              <TableCell>
                <code className="font-mono text-xs text-neutral-11">{row.type}</code>
              </TableCell>
              <TableCell>
                {row.default === undefined ? (
                  <span className="text-neutral-9">—</span>
                ) : (
                  <code className="font-mono text-xs text-neutral-11">{row.default}</code>
                )}
              </TableCell>
              <TableCell className="text-neutral-11">{row.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
