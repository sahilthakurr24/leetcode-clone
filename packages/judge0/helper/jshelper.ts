import type { TypeCodec } from "../types";
import { UnsupportedTypeError } from "./shared";

/**
 * JavaScript helper functions: the per-type codec table + lookup used by the JS
 * generator (javascript/generator.ts). JS is dynamically typed, so the `type`
 * only selects read/dump: plain values go through JSON.parse / JSON.stringify;
 * TreeNode/ListNode use the builders in javascript/template.ts (JS_HARNESS).
 */

const jsonRead = (line: string) => `JSON.parse(${line})`;
const jsonDump = (value: string) => `JSON.stringify(${value})`;
const plain: TypeCodec = { read: jsonRead, dump: jsonDump };

const JS_TYPE_TABLE: Record<string, TypeCodec> = {
  number: plain,
  "number[]": plain,
  "number[][]": plain,
  string: plain,
  "string[]": plain,
  "string[][]": plain,
  boolean: plain,
  "boolean[]": plain,
  char: plain,
  "char[]": plain,
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
  const codec = JS_TYPE_TABLE[type.trim()];
  if (!codec) throw new UnsupportedTypeError(type);
  return codec;
}
