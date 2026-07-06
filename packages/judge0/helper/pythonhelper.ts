import type { TypeCodec } from "../types";
import { UnsupportedTypeError } from "./shared";

/**
 * Python helper functions: the per-type codec table + lookup used by the Python
 * generator (python/generator.ts). Plain values use json.loads / dumps; the
 * TreeNode/ListNode builders live in python/template.ts (PYTHON_HARNESS).
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

const PYTHON_TYPE_TABLE: Record<string, TypeCodec> = {
  int: plain,
  float: plain,
  bool: plain,
  str: plain,

  "List[int]": plain,
  "List[float]": plain,
  "List[bool]": plain,
  "List[str]": plain,
  "List[List[int]]": plain,
  "List[List[str]]": plain,

  TreeNode: treeCodec,
  "Optional[TreeNode]": treeCodec,
  ListNode: listCodec,
  "Optional[ListNode]": listCodec,
};

/** Collapse whitespace inside subscripts, e.g. "List[ int ]" -> "List[int]". */
function normalizeType(type: string): string {
  return type
    .trim()
    .replace(/\s*([[\],])\s*/g, "$1")
    .replace(/\s+/g, " ");
}

export function pythonCodecFor(type: string): TypeCodec {
  const codec = PYTHON_TYPE_TABLE[normalizeType(type)];
  if (!codec) throw new UnsupportedTypeError(type);
  return codec;
}
