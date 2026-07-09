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

export function pythonCodecFor(type: string): TypeCodec {
  const t = type.trim();
  if (!isCanonicalType(t)) throw new UnsupportedTypeError(type);
  return PYTHON_TYPE_TABLE[t];
}
