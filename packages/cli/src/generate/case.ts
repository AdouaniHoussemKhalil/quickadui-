// Tiny, dependency-free string-case helpers used to turn a `--fields`
// entry's field name or a `generate`'d resource's type name into the
// right casing for a variable, a file name, or a URL path segment.
// Deliberately hand-rolled, same reasoning as `args.ts`: this CLI has no
// runtime dependencies at all, and a real case-conversion library would
// be one more thing this sandbox can't install and exercise against the
// real package.

/**
 * "Product" -> "Product", "product name" -> "ProductName",
 * "product_name" -> "ProductName", "productName" -> "ProductName".
 */
export function toPascalCase(name: string): string {
  return name
    .split(/[\s_-]+/)
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/** Same as `toPascalCase`, but the first letter is lowercase. */
export function toCamelCase(name: string): string {
  const pascal = toPascalCase(name);
  return pascal.length === 0 ? pascal : pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * "ProductName" -> "product-name", "product_name" -> "product-name" —
 * used for generated file/folder names.
 */
export function toKebabCase(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

/**
 * "productName" -> "Product name" — used for a generated `<TableHead>`/
 * `<FormLabel>` column or field label. Only splits camelCase boundaries;
 * a field name already written with spaces or underscores is normalized
 * to lowercase words separated by a single space instead.
 */
export function toLabel(name: string): string {
  const words = name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 0);
  if (words.length === 0) {
    return name;
  }
  const [first, ...rest] = words;
  return [first ? first.charAt(0).toUpperCase() + first.slice(1) : "", ...rest].join(" ");
}

/**
 * Naive English pluralization — `+s`, or `+es` after a trailing
 * s/x/z/ch/sh, or `y` -> `ies` after a consonant. Good enough for the
 * common case (used only to name the generated `list<Type>s()` function);
 * irregular nouns ("category" is actually the `y` case and works,
 * "person"/"child" etc. don't) read a little odd but are cosmetic only —
 * the real HTTP path comes from the separate, explicit `--endpoint` flag,
 * not from this function. Renaming the generated function is always safe.
 */
export function toNaivePlural(word: string): string {
  if (/[sxz]$/i.test(word) || /[cs]h$/i.test(word)) {
    return `${word}es`;
  }
  if (/[^aeiou]y$/i.test(word)) {
    return `${word.slice(0, -1)}ies`;
  }
  return `${word}s`;
}
