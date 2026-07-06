import type { TypeCodec } from "../types";
import { UnsupportedTypeError } from "./shared";

/**
 * C++ helper functions: the per-type codec table and its lookup, used by the
 * C++ generator (cpp/generator.ts). Each entry says how to parse one stdin line
 * into a value (`read`) and how to print it as canonical compact JSON (`dump`).
 * The matching C++ functions live in cpp/template.ts (CPP_HARNESS).
 */

const jsonRead = (fn: string) => (line: string) => `${fn}(parseJson(${line}))`;
const plainDump = (value: string) => `dump(${value})`;

export const CPP_TYPE_TABLE: Record<string, TypeCodec> = {
  int: { read: jsonRead("toInt"), dump: plainDump },
  "long long": { read: jsonRead("toLong"), dump: plainDump },
  double: { read: jsonRead("toDouble"), dump: plainDump },
  bool: { read: jsonRead("toBool"), dump: plainDump },
  string: { read: jsonRead("toStr"), dump: plainDump },
  char: { read: jsonRead("toChar"), dump: plainDump },

  "vector<int>": { read: jsonRead("toVecInt"), dump: plainDump },
  "vector<long long>": { read: jsonRead("toVecLong"), dump: plainDump },
  "vector<double>": { read: jsonRead("toVecDouble"), dump: plainDump },
  "vector<bool>": { read: jsonRead("toVecBool"), dump: plainDump },
  "vector<string>": { read: jsonRead("toVecStr"), dump: plainDump },
  "vector<char>": { read: jsonRead("toVecChar"), dump: plainDump },

  "vector<vector<int>>": { read: jsonRead("toVecVecInt"), dump: plainDump },
  "vector<vector<string>>": { read: jsonRead("toVecVecStr"), dump: plainDump },
  "vector<vector<char>>": { read: jsonRead("toVecVecChar"), dump: plainDump },

  "TreeNode*": {
    read: jsonRead("buildTree"),
    dump: (value) => `dumpTree(${value})`,
  },
  "ListNode*": {
    read: jsonRead("buildList"),
    dump: (value) => `dumpList(${value})`,
  },
};

/** Collapse whitespace around `<`, `>`, `,` while keeping `long long`. */
export function normalizeType(type: string): string {
  return type
    .trim()
    .replace(/\s*([<>,])\s*/g, "$1")
    .replace(/\s+/g, " ");
}

/** Look up the codec for a C++ type, or throw if it isn't supported. */
export function codecFor(type: string): TypeCodec {
  const codec = CPP_TYPE_TABLE[normalizeType(type)];
  if (!codec) throw new UnsupportedTypeError(type);
  return codec;
}
