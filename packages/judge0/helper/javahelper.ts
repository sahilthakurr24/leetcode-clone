import type { TypeCodec } from "../types";
import { UnsupportedTypeError } from "./shared";

/**
 * Java helper functions: the per-type codec table + lookup used by the Java
 * generator (java/generator.ts). Primitive/array/String types use the
 * overloaded `dump`; List and node types use dedicated writers. The matching
 * Java methods live in java/template.ts (JAVA_HARNESS).
 */

const read = (fn: string) => (line: string) => `${fn}(parseJson(${line}))`;
const plainDump = (value: string) => `dump(${value})`;

const JAVA_TYPE_TABLE: Record<string, TypeCodec> = {
  int: { read: read("toInt"), dump: plainDump },
  long: { read: read("toLong"), dump: plainDump },
  double: { read: read("toDouble"), dump: plainDump },
  boolean: { read: read("toBool"), dump: plainDump },
  String: { read: read("toStr"), dump: plainDump },
  char: { read: read("toChar"), dump: plainDump },

  "int[]": { read: read("toIntArray"), dump: plainDump },
  "long[]": { read: read("toLongArray"), dump: plainDump },
  "double[]": { read: read("toDoubleArray"), dump: plainDump },
  "boolean[]": { read: read("toBoolArray"), dump: plainDump },
  "String[]": { read: read("toStringArray"), dump: plainDump },
  "char[]": { read: read("toCharArray"), dump: plainDump },

  "int[][]": { read: read("toIntArray2D"), dump: plainDump },
  "char[][]": { read: read("toCharArray2D"), dump: plainDump },
  "String[][]": { read: read("toStringArray2D"), dump: plainDump },

  "List<Integer>": { read: read("toIntList"), dump: (v) => `dumpIntList(${v})` },
  "List<String>": { read: read("toStrList"), dump: (v) => `dumpStrList(${v})` },

  TreeNode: { read: read("buildTree"), dump: (v) => `dumpTree(${v})` },
  ListNode: { read: read("buildList"), dump: (v) => `dumpList(${v})` },
};

function normalizeType(type: string): string {
  return type
    .trim()
    .replace(/\s*([<>,\][])\s*/g, "$1")
    .replace(/\s+/g, " ");
}

export function javaCodecFor(type: string): TypeCodec {
  const codec = JAVA_TYPE_TABLE[normalizeType(type)];
  if (!codec) throw new UnsupportedTypeError(type);
  return codec;
}
