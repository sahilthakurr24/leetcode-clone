import type { TypeCodec } from "../types";
import { UnsupportedTypeError } from "./shared";

/**
 * Go helper functions: the per-type codec table + lookup used by the Go
 * generator (go/generator.ts). Plain values use the typed readers + `dump`
 * (json.Marshal); TreeNode/ListNode use the builders in go/template.ts.
 */

const read = (fn: string) => (line: string) => `${fn}(${line})`;
const plainDump = (value: string) => `dump(${value})`;

const GO_TYPE_TABLE: Record<string, TypeCodec> = {
  int: { read: read("readInt"), dump: plainDump },
  int64: { read: read("readInt64"), dump: plainDump },
  float64: { read: read("readFloat"), dump: plainDump },
  bool: { read: read("readBool"), dump: plainDump },
  string: { read: read("readString"), dump: plainDump },

  "[]int": { read: read("readIntArray"), dump: plainDump },
  "[]int64": { read: read("readInt64Array"), dump: plainDump },
  "[]float64": { read: read("readFloatArray"), dump: plainDump },
  "[]string": { read: read("readStringArray"), dump: plainDump },
  "[]bool": { read: read("readBoolArray"), dump: plainDump },

  "[][]int": { read: read("readIntArray2D"), dump: plainDump },
  "[][]string": { read: read("readStringArray2D"), dump: plainDump },

  "*TreeNode": { read: read("readTree"), dump: (v) => `dumpTree(${v})` },
  "*ListNode": { read: read("readList"), dump: (v) => `dumpList(${v})` },
};

function normalizeType(type: string): string {
  return type.trim().replace(/\s+/g, "");
}

export function goCodecFor(type: string): TypeCodec {
  const codec = GO_TYPE_TABLE[normalizeType(type)];
  if (!codec) throw new UnsupportedTypeError(type);
  return codec;
}
