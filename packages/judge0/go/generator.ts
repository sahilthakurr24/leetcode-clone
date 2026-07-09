import type { Generator, ProblemSignature } from "../types";
import { goCodecFor, goDeclFor } from "../helper/gohelper";
import { GO_HARNESS } from "./template";

/**
 * Assemble the full runnable Go source for a submission:
 *   package + imports + harness + `func fn(params) ret { userCode }` + `main()`
 *   that reads the args from stdin, calls the function, and prints the result.
 *
 * NOTE: not verified against a local Go toolchain (none installed) — validate
 * on the Judge0 VM.
 */
export function GoHarnessGenerator(
  signature: ProblemSignature,
  userCode: string,
): string {
  const { functionName, parameters, returnType } = signature;

  const parameterList = parameters
    .map((p) => `${p.name} ${goDeclFor(p.type)}`)
    .join(", ");
  const argumentList = parameters.map((p) => p.name).join(", ");

  const inputDecls = parameters
    .map(
      (p, idx) => `\t${p.name} := ${goCodecFor(p.type).read(`lines[${idx}]`)}`,
    )
    .join("\n");

  const printResult = `\tfmt.Print(${goCodecFor(returnType).dump("result")})`;

  return `package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"strings"
)
${GO_HARNESS}
func ${functionName}(${parameterList}) ${goDeclFor(returnType)} {
${userCode}
}

func main() {
	lines := readAllLines()
${inputDecls}
	result := ${functionName}(${argumentList})
${printResult}
}
`;
}

export const goGenerator: Generator = {
  generateSource: GoHarnessGenerator,
};
