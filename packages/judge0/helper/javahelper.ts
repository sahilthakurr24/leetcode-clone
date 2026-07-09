import type { TypeCodec } from "../types";
import { UnsupportedTypeError } from "./shared";
import { isCanonicalType, type CanonicalType } from "./canonical";

/**
 * Java helper functions: canonical-type → declared Java type + codec, used by
 * the Java generator (java/generator.ts). Primitive/array/String types use the
 * overloaded `dump`; node types use dedicated writers. The matching Java
 * methods live in java/template.ts (JAVA_HARNESS).
 */

const read = (fn: string) => (line: string) => `${fn}(parseJson(${line}))`;
const plainDump = (value: string) => `dump(${value})`;

/** Canonical type → the Java type written in the Solution signature. */
const JAVA_DECL: Record<CanonicalType, string> = {
  int: "int",
  long: "long",
  double: "double",
  bool: "boolean",
  string: "String",
  char: "char",

  "int[]": "int[]",
  "long[]": "long[]",
  "double[]": "double[]",
  "bool[]": "boolean[]",
  "string[]": "String[]",
  "char[]": "char[]",

  "int[][]": "int[][]",
  "string[][]": "String[][]",
  "char[][]": "char[][]",

  TreeNode: "TreeNode",
  ListNode: "ListNode",
};

const JAVA_TYPE_TABLE: Record<CanonicalType, TypeCodec> = {
  int: { read: read("toInt"), dump: plainDump },
  long: { read: read("toLong"), dump: plainDump },
  double: { read: read("toDouble"), dump: plainDump },
  bool: { read: read("toBool"), dump: plainDump },
  string: { read: read("toStr"), dump: plainDump },
  char: { read: read("toChar"), dump: plainDump },

  "int[]": { read: read("toIntArray"), dump: plainDump },
  "long[]": { read: read("toLongArray"), dump: plainDump },
  "double[]": { read: read("toDoubleArray"), dump: plainDump },
  "bool[]": { read: read("toBoolArray"), dump: plainDump },
  "string[]": { read: read("toStringArray"), dump: plainDump },
  "char[]": { read: read("toCharArray"), dump: plainDump },

  "int[][]": { read: read("toIntArray2D"), dump: plainDump },
  "string[][]": { read: read("toStringArray2D"), dump: plainDump },
  "char[][]": { read: read("toCharArray2D"), dump: plainDump },

  TreeNode: { read: read("buildTree"), dump: (v) => `dumpTree(${v})` },
  ListNode: { read: read("buildList"), dump: (v) => `dumpList(${v})` },
};

function canon(type: string): CanonicalType {
  const t = type.trim();
  if (!isCanonicalType(t)) throw new UnsupportedTypeError(type);
  return t;
}

/** The Java type to declare for a canonical type, or throw if unsupported. */
export function javaDeclFor(type: string): string {
  return JAVA_DECL[canon(type)];
}

export function javaCodecFor(type: string): TypeCodec {
  return JAVA_TYPE_TABLE[canon(type)];
}
