declare module "*.mdx" {
  import type { ComponentType } from "react";

  // MDX components accept whatever props the importer passes (none, in
  // this app — every page is rendered bare by `Root.tsx`). `@types/mdx`
  // would give this a real, generated-per-file prop shape; skipped here to
  // avoid one more dependency this sandbox can't validate against real
  // types with no npm registry access (see the project status doc).
  const MDXComponent: ComponentType<Record<string, unknown>>;
  export default MDXComponent;
}
