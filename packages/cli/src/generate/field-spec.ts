// Parses the `--fields` flag shared by `quickadui generate resource` and
// (for now, internally) nothing else — kept as its own module because
// both the schema template and the page templates need the same parsed
// list, in the same order, and order matters: it drives the column order
// in the generated list page and the field order in the generated form.

export type FieldType = "string" | "number" | "boolean";

const FIELD_TYPES: readonly FieldType[] = ["string", "number", "boolean"];

// Field names become object property names accessed with dot notation
// (`product.title`) and JSX expressions in the generated code — anything
// that isn't a valid JS identifier would produce code that doesn't even
// parse, so this is checked at parse time with a clear error rather than
// surfacing as a confusing syntax error in a generated file later.
const VALID_FIELD_NAME = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

export interface FieldSpec {
  readonly name: string;
  readonly type: FieldType;
}

function isFieldType(value: string): value is FieldType {
  return (FIELD_TYPES as readonly string[]).includes(value);
}

/**
 * Parses `"title:string,price:number,inStock:boolean"` into an ordered
 * list of `{ name, type }` pairs. Whitespace around commas/colons is
 * tolerated. Throws with a message naming the exact bad entry — this is
 * user-typed CLI input, not internal data, so a vague "invalid fields"
 * error would be a real papercut.
 */
export function parseFieldSpec(raw: string): readonly FieldSpec[] {
  const fields: FieldSpec[] = [];
  const seen = new Set<string>();

  for (const rawEntry of raw.split(",")) {
    const entry = rawEntry.trim();
    if (entry === "") {
      continue;
    }

    const colonIndex = entry.indexOf(":");
    if (colonIndex === -1) {
      throw new Error(
        `Invalid --fields entry "${entry}". Expected "name:type", e.g. "title:string".`,
      );
    }

    const name = entry.slice(0, colonIndex).trim();
    const rawType = entry.slice(colonIndex + 1).trim();

    if (name === "") {
      throw new Error(`Invalid --fields entry "${entry}": missing a field name before ":".`);
    }
    if (!VALID_FIELD_NAME.test(name)) {
      throw new Error(
        `Invalid field name "${name}": must be a valid JS identifier (letters, digits, "_"/"$", not starting with a digit) — it becomes a property name in generated code.`,
      );
    }
    if (!isFieldType(rawType)) {
      throw new Error(
        `Unknown field type "${rawType}" for "${name}". Supported types: ${FIELD_TYPES.join(", ")}.`,
      );
    }
    if (seen.has(name)) {
      throw new Error(`Duplicate field name "${name}" in --fields.`);
    }

    seen.add(name);
    fields.push({ name, type: rawType });
  }

  if (fields.length === 0) {
    throw new Error(
      '`--fields` is required and can\'t be empty, e.g. --fields "title:string,price:number".',
    );
  }

  return fields;
}
