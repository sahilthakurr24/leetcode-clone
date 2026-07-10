import type { TypeCodec } from "../types";
import { UnsupportedTypeError } from "./shared";
import { isCanonicalType, type CanonicalType } from "./canonical";

/**
 * Python helper functions: canonical-type → codec, used by the Python generator
 * (python/generator.ts). Python signatures are untyped, so there is no decl
 * table: the type only selects read/dump. Plain values use json.loads / dumps;
 * the TreeNode/ListNode builders live in python/template.ts (PYTHON_HARNESS).
 */

const jsonRead = (line: string) => `json.loads(${line})`;
const plainDump = (value: string) => `dumps(${value})`;
const plain: TypeCodec = { read: jsonRead, dump: plainDump };

const treeCodec: TypeCodec = {
  read: (l) => `build_tree(json.loads(${l}))`,
  dump: (v) => `dump_tree(${v})`,
};
const listCodec: TypeCodec = {
  read: (l) => `build_list(json.loads(${l}))`,
  dump: (v) => `dump_list(${v})`,
};

const PYTHON_TYPE_TABLE: Record<CanonicalType, TypeCodec> = {
  int: plain,
  long: plain,
  double: plain,
  bool: plain,
  string: plain,
  char: plain,

  "int[]": plain,
  "long[]": plain,
  "double[]": plain,
  "bool[]": plain,
  "string[]": plain,
  "char[]": plain,

  "int[][]": plain,
  "string[][]": plain,
  "char[][]": plain,

  TreeNode: treeCodec,
  ListNode: listCodec,
};

/** Canonical type → the Python type hint written in the starter signature. */
const PY_DECL: Record<CanonicalType, string> = {
  int: "int",
  long: "int",
  double: "float",
  bool: "bool",
  string: "str",
  char: "str",

  "int[]": "List[int]",
  "long[]": "List[int]",
  "double[]": "List[float]",
  "bool[]": "List[bool]",
  "string[]": "List[str]",
  "char[]": "List[str]",

  "int[][]": "List[List[int]]",
  "string[][]": "List[List[str]]",
  "char[][]": "List[List[str]]",

  TreeNode: "Optional[TreeNode]",
  ListNode: "Optional[ListNode]",
};

function canon(type: string): CanonicalType {
  const t = type.trim();
  if (!isCanonicalType(t)) throw new UnsupportedTypeError(type);
  return t;
}

/** The Python type hint for a canonical type, or throw if unsupported. */
export function pythonDeclFor(type: string): string {
  return PY_DECL[canon(type)];
}

export function pythonCodecFor(type: string): TypeCodec {
  return PYTHON_TYPE_TABLE[canon(type)];
}
