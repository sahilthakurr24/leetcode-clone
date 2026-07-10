import type { TypeCodec } from "../types";
import { UnsupportedTypeError } from "./shared";
import { isCanonicalType, type CanonicalType } from "./canonical";

/**
 * C++ helper functions: canonical-type → declared C++ type + codec, used by the
 * C++ generator (cpp/generator.ts). Each codec says how to parse one stdin line
 * into a value (`read`) and how to print it as canonical compact JSON (`dump`).
 * The matching C++ functions live in cpp/template.ts (CPP_HARNESS).
 */

const jsonRead = (fn: string) => (line: string) => `${fn}(parseJson(${line}))`;
const plainDump = (value: string) => `dump(${value})`;

/** Canonical type → the C++ type written in the Solution signature. */
const CPP_DECL: Record<CanonicalType, string> = {
  int: "int",
  long: "long long",
  double: "double",
  bool: "bool",
  string: "string",
  char: "char",

  "int[]": "vector<int>",
  "long[]": "vector<long long>",
  "double[]": "vector<double>",
  "bool[]": "vector<bool>",
  "string[]": "vector<string>",
  "char[]": "vector<char>",

  "int[][]": "vector<vector<int>>",
  "string[][]": "vector<vector<string>>",
  "char[][]": "vector<vector<char>>",

  TreeNode: "TreeNode*",
  ListNode: "ListNode*",
};

const CPP_TYPE_TABLE: Record<CanonicalType, TypeCodec> = {
  int: { read: jsonRead("toInt"), dump: plainDump },
  long: { read: jsonRead("toLong"), dump: plainDump },
  double: { read: jsonRead("toDouble"), dump: plainDump },
  bool: { read: jsonRead("toBool"), dump: plainDump },
  string: { read: jsonRead("toStr"), dump: plainDump },
  char: { read: jsonRead("toChar"), dump: plainDump },

  "int[]": { read: jsonRead("toVecInt"), dump: plainDump },
  "long[]": { read: jsonRead("toVecLong"), dump: plainDump },
  "double[]": { read: jsonRead("toVecDouble"), dump: plainDump },
  "bool[]": { read: jsonRead("toVecBool"), dump: plainDump },
  "string[]": { read: jsonRead("toVecStr"), dump: plainDump },
  "char[]": { read: jsonRead("toVecChar"), dump: plainDump },

  "int[][]": { read: jsonRead("toVecVecInt"), dump: plainDump },
  "string[][]": { read: jsonRead("toVecVecStr"), dump: plainDump },
  "char[][]": { read: jsonRead("toVecVecChar"), dump: plainDump },

  TreeNode: {
    read: jsonRead("buildTree"),
    dump: (value) => `dumpTree(${value})`,
  },
  ListNode: {
    read: jsonRead("buildList"),
    dump: (value) => `dumpList(${value})`,
  },
};

function canon(type: string): CanonicalType {
  const t = type.trim();
  if (!isCanonicalType(t)) throw new UnsupportedTypeError(type);
  return t;
}

/** The C++ type to declare for a canonical type, or throw if unsupported. */
export function cppDeclFor(type: string): string {
  return CPP_DECL[canon(type)];
}

/**
 * Parameter type as written in the starter skeleton: containers and strings go
 * by reference (`vector<int>&`), scalars and node pointers by value.
 */
export function cppStarterParamFor(type: string): string {
  const decl = CPP_DECL[canon(type)];
  const byRef = decl.startsWith("vector<") || decl === "string";
  return byRef ? `${decl}&` : decl;
}

/** Look up the codec for a canonical type, or throw if it isn't supported. */
export function codecFor(type: string): TypeCodec {
  return CPP_TYPE_TABLE[canon(type)];
}
