import type { TypeCodec } from "../types";
import { UnsupportedTypeError } from "./shared";
import { isCanonicalType, type CanonicalType } from "./canonical";

/**
 * JavaScript helper functions: canonical-type → codec, used by the JS generator
 * (javascript/generator.ts). JS is dynamically typed, so the type only selects
 * read/dump: plain values go through JSON.parse / JSON.stringify;
 * TreeNode/ListNode use the builders in javascript/template.ts (JS_HARNESS).
 */

const jsonRead = (line: string) => `JSON.parse(${line})`;
const jsonDump = (value: string) => `JSON.stringify(${value})`;
const plain: TypeCodec = { read: jsonRead, dump: jsonDump };

const JS_TYPE_TABLE: Record<CanonicalType, TypeCodec> = {
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

  TreeNode: {
    read: (l) => `buildTree(JSON.parse(${l}))`,
    dump: (v) => `dumpTree(${v})`,
  },
  ListNode: {
    read: (l) => `buildList(JSON.parse(${l}))`,
    dump: (v) => `dumpList(${v})`,
  },
};

export function jsCodecFor(type: string): TypeCodec {
  const t = type.trim();
  if (!isCanonicalType(t)) throw new UnsupportedTypeError(type);
  return JS_TYPE_TABLE[t];
}
