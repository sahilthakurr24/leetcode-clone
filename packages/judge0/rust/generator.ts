import type { Generator, ProblemSignature } from "../types";
import { rustCodecFor, rustDeclFor } from "../helper/rusthelper";
import { RUST_HARNESS } from "./template";

/**
 * Assemble the full runnable Rust source for a submission:
 *   harness + `struct Solution;` + the user's complete `impl Solution` block
 *   (verbatim) + a `main()` that reads the args from stdin, calls the function,
 *   and prints the canonical result.
 */
export function RustHarnessGenerator(
  signature: ProblemSignature,
  userCode: string,
): string {
  const { functionName, parameters, returnType } = signature;

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

${userCode}

fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();
    let lines: Vec<&str> = input.split('\\n').collect();
${inputDecls}
    let result = Solution::${functionName}(${argumentList});
${printResult}
}
`;
}

function RustStarterGenerator(signature: ProblemSignature): string {
  const { functionName, parameters, returnType } = signature;

  const paramList = parameters
    .map((p) => `${p.name}: ${rustDeclFor(p.type)}`)
    .join(", ");

  return `impl Solution {
    pub fn ${functionName}(${paramList}) -> ${rustDeclFor(returnType)} {

    }
}`;
}

export const rustGenerator: Generator = {
  generateSource: RustHarnessGenerator,
  generateStarter: RustStarterGenerator,
};
