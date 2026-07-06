import type { TypeCodec } from "../types";
import { UnsupportedTypeError } from "./shared";

/**
 * Rust helper functions: the per-type codec table + lookup used by the Rust
 * generator (rust/generator.ts). The `read`/`dump` functions live in
 * rust/template.ts (RUST_HARNESS).
 */

const read = (fn: string) => (line: string) => `${fn}(&parse_json(${line}))`;
const dump = (fn: string) => (value: string) => `${fn}(&${value})`;

const RUST_TYPE_TABLE: Record<string, TypeCodec> = {
  i32: { read: read("to_i32"), dump: dump("dump_i32") },
  i64: { read: read("to_i64"), dump: dump("dump_i64") },
  f64: { read: read("to_f64"), dump: dump("dump_f64") },
  bool: { read: read("to_bool"), dump: dump("dump_bool") },
  String: { read: read("to_string"), dump: dump("dump_string") },

  "Vec<i32>": { read: read("to_vec_i32"), dump: dump("dump_vec_i32") },
  "Vec<i64>": { read: read("to_vec_i64"), dump: dump("dump_vec_i64") },
  "Vec<f64>": { read: read("to_vec_f64"), dump: dump("dump_vec_f64") },
  "Vec<bool>": { read: read("to_vec_bool"), dump: dump("dump_vec_bool") },
  "Vec<String>": { read: read("to_vec_string"), dump: dump("dump_vec_string") },

  "Vec<Vec<i32>>": { read: read("to_vec_vec_i32"), dump: dump("dump_vec_vec_i32") },
  "Vec<Vec<String>>": { read: read("to_vec_vec_string"), dump: dump("dump_vec_vec_string") },

  "Option<Rc<RefCell<TreeNode>>>": { read: read("build_tree"), dump: dump("dump_tree") },
  "Option<Box<ListNode>>": { read: read("build_list"), dump: dump("dump_list") },
};

function normalizeType(type: string): string {
  return type.trim().replace(/\s+/g, "");
}

export function rustCodecFor(type: string): TypeCodec {
  const codec = RUST_TYPE_TABLE[normalizeType(type)];
  if (!codec) throw new UnsupportedTypeError(type);
  return codec;
}
