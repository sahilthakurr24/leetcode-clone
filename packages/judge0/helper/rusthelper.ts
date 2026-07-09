import type { TypeCodec } from "../types";
import { UnsupportedTypeError } from "./shared";
import { isCanonicalType, type CanonicalType } from "./canonical";

/**
 * Rust helper functions: canonical-type → declared Rust type + codec, used by
 * the Rust generator (rust/generator.ts). The `read`/`dump` functions live in
 * rust/template.ts (RUST_HARNESS). `char` maps to String so it survives the
 * JSON wire format.
 */

const read = (fn: string) => (line: string) => `${fn}(&parse_json(${line}))`;
const dump = (fn: string) => (value: string) => `${fn}(&${value})`;

/** Canonical type → the Rust type written in the fn signature. */
const RUST_DECL: Record<CanonicalType, string> = {
  int: "i32",
  long: "i64",
  double: "f64",
  bool: "bool",
  string: "String",
  char: "String",

  "int[]": "Vec<i32>",
  "long[]": "Vec<i64>",
  "double[]": "Vec<f64>",
  "bool[]": "Vec<bool>",
  "string[]": "Vec<String>",
  "char[]": "Vec<String>",

  "int[][]": "Vec<Vec<i32>>",
  "string[][]": "Vec<Vec<String>>",
  "char[][]": "Vec<Vec<String>>",

  TreeNode: "Option<Rc<RefCell<TreeNode>>>",
  ListNode: "Option<Box<ListNode>>",
};

const RUST_TYPE_TABLE: Record<CanonicalType, TypeCodec> = {
  int: { read: read("to_i32"), dump: dump("dump_i32") },
  long: { read: read("to_i64"), dump: dump("dump_i64") },
  double: { read: read("to_f64"), dump: dump("dump_f64") },
  bool: { read: read("to_bool"), dump: dump("dump_bool") },
  string: { read: read("to_string"), dump: dump("dump_string") },
  char: { read: read("to_string"), dump: dump("dump_string") },

  "int[]": { read: read("to_vec_i32"), dump: dump("dump_vec_i32") },
  "long[]": { read: read("to_vec_i64"), dump: dump("dump_vec_i64") },
  "double[]": { read: read("to_vec_f64"), dump: dump("dump_vec_f64") },
  "bool[]": { read: read("to_vec_bool"), dump: dump("dump_vec_bool") },
  "string[]": { read: read("to_vec_string"), dump: dump("dump_vec_string") },
  "char[]": { read: read("to_vec_string"), dump: dump("dump_vec_string") },

  "int[][]": { read: read("to_vec_vec_i32"), dump: dump("dump_vec_vec_i32") },
  "string[][]": { read: read("to_vec_vec_string"), dump: dump("dump_vec_vec_string") },
  "char[][]": { read: read("to_vec_vec_string"), dump: dump("dump_vec_vec_string") },

  TreeNode: { read: read("build_tree"), dump: dump("dump_tree") },
  ListNode: { read: read("build_list"), dump: dump("dump_list") },
};

function canon(type: string): CanonicalType {
  const t = type.trim();
  if (!isCanonicalType(t)) throw new UnsupportedTypeError(type);
  return t;
}

/** The Rust type to declare for a canonical type, or throw if unsupported. */
export function rustDeclFor(type: string): string {
  return RUST_DECL[canon(type)];
}

export function rustCodecFor(type: string): TypeCodec {
  return RUST_TYPE_TABLE[canon(type)];
}
