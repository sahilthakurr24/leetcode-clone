import type { TypeCodec } from "../types";
import { UnsupportedTypeError } from "./shared";
import { isCanonicalType, type CanonicalType } from "./canonical";

/**
 * Go helper functions: canonical-type → declared Go type + codec, used by the
 * Go generator (go/generator.ts). Plain values use the typed readers + `dump`
 * (json.Marshal); TreeNode/ListNode use the builders in go/template.ts.
 * `char` has no Go equivalent that survives JSON, so it maps to string.
 */

const read = (fn: string) => (line: string) => `${fn}(${line})`;
const plainDump = (value: string) => `dump(${value})`;

/** Canonical type → the Go type written in the function signature. */
const GO_DECL: Record<CanonicalType, string> = {
  int: "int",
  long: "int64",
  double: "float64",
  bool: "bool",
  string: "string",
  char: "string",

  "int[]": "[]int",
  "long[]": "[]int64",
  "double[]": "[]float64",
  "bool[]": "[]bool",
  "string[]": "[]string",
  "char[]": "[]string",

  "int[][]": "[][]int",
  "string[][]": "[][]string",
  "char[][]": "[][]string",

  TreeNode: "*TreeNode",
  ListNode: "*ListNode",
};

const GO_TYPE_TABLE: Record<CanonicalType, TypeCodec> = {
  int: { read: read("readInt"), dump: plainDump },
  long: { read: read("readInt64"), dump: plainDump },
  double: { read: read("readFloat"), dump: plainDump },
  bool: { read: read("readBool"), dump: plainDump },
  string: { read: read("readString"), dump: plainDump },
  char: { read: read("readString"), dump: plainDump },

  "int[]": { read: read("readIntArray"), dump: plainDump },
  "long[]": { read: read("readInt64Array"), dump: plainDump },
  "double[]": { read: read("readFloatArray"), dump: plainDump },
  "bool[]": { read: read("readBoolArray"), dump: plainDump },
  "string[]": { read: read("readStringArray"), dump: plainDump },
  "char[]": { read: read("readStringArray"), dump: plainDump },

  "int[][]": { read: read("readIntArray2D"), dump: plainDump },
  "string[][]": { read: read("readStringArray2D"), dump: plainDump },
  "char[][]": { read: read("readStringArray2D"), dump: plainDump },

  TreeNode: { read: read("readTree"), dump: (v) => `dumpTree(${v})` },
  ListNode: { read: read("readList"), dump: (v) => `dumpList(${v})` },
};

function canon(type: string): CanonicalType {
  const t = type.trim();
  if (!isCanonicalType(t)) throw new UnsupportedTypeError(type);
  return t;
}

/** The Go type to declare for a canonical type, or throw if unsupported. */
export function goDeclFor(type: string): string {
  return GO_DECL[canon(type)];
}

export function goCodecFor(type: string): TypeCodec {
  return GO_TYPE_TABLE[canon(type)];
}
