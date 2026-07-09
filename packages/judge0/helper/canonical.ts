/**
 * Canonical, language-agnostic type names for problem signatures. Problems
 * store ONLY these in `problem_params.type` / `problems.return_type`; each
 * language helper maps a canonical type to its own declared type (for the
 * generated function signature) and codec (stdin parse / stdout dump).
 *
 * Adding a type here requires adding it to every language's DECL/TYPE table
 * (or throwing UnsupportedTypeError where a language can't express it, as C
 * does for 2D arrays).
 */
export const CANONICAL_TYPES = [
  "int",
  "long",
  "double",
  "bool",
  "string",
  "char",

  "int[]",
  "long[]",
  "double[]",
  "bool[]",
  "string[]",
  "char[]",

  "int[][]",
  "string[][]",
  "char[][]",

  "TreeNode",
  "ListNode",
] as const;

export type CanonicalType = (typeof CANONICAL_TYPES)[number];

const CANONICAL_SET: ReadonlySet<string> = new Set(CANONICAL_TYPES);

export function isCanonicalType(type: string): type is CanonicalType {
  return CANONICAL_SET.has(type.trim());
}

/** Trim the incoming string and narrow it, throwing on unknown types. */
export function asCanonicalType(type: string): CanonicalType {
  const t = type.trim();
  if (!isCanonicalType(t)) {
    throw new Error(
      `Unknown canonical type: "${type}". Expected one of: ${CANONICAL_TYPES.join(", ")}`,
    );
  }
  return t;
}
