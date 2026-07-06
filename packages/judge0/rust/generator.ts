import type { Generator, ProblemSignature } from "../types";
import { rustCodecFor } from "../helper/rusthelper";
import { RUST_HARNESS } from "./template";

/**
 * Assemble the full runnable Rust source for a submission:
 *   harness + `impl Solution { pub fn fn(params) -> ret { userCode } }` + a
 *   `main()` that reads the args from stdin, calls the function, and prints the
 *   canonical result.
 *
 * NOTE: not verified against a local Rust toolchain (none installed) — validate
 * on the Judge0 VM.
 */
export function RustHarnessGenerator(
  signature: ProblemSignature,
  userCode: string,
): string {
  const { functionName, parameters, returnType } = signature;

  const parameterList = parameters
    .map((p) => `${p.name}: ${p.type}`)
    .join(", ");
  const argumentList = parameters.map((p) => p.name).join(", ");

  const inputDecls = parameters
    .map(
      (p, idx) =>
        `    let ${p.name} = ${rustCodecFor(p.type).read(`lines[${idx}]`)};`,
    )
    .join("\n");

  const printResult = `    print!("{}", ${rustCodecFor(returnType).dump("result")});`;

  return `#![allow(dead_code, unused_variables, non_snake_case, unused_imports)]
use std::io::{self, Read};
use std::rc::Rc;
use std::cell::RefCell;
use std::collections::VecDeque;
${RUST_HARNESS}
struct Solution;

impl Solution {
    pub fn ${functionName}(${parameterList}) -> ${returnType} {
${userCode}
    }
}

fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();
    let lines: Vec<&str> = input.split('\n').collect();
${inputDecls}
    let result = Solution::${functionName}(${argumentList});
${printResult}
}
`;
}

export const rustGenerator: Generator = {
  generateSource: RustHarnessGenerator,
};
