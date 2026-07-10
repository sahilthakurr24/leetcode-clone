import type { Generator, ProblemSignature } from "../types";
import { goCodecFor, goDeclFor } from "../helper/gohelper";
import { GO_HARNESS } from "./template";

/**
 * Assemble the full runnable Go source for a submission:
 *   package + imports + harness + the user's complete function (verbatim) +
 *   `main()` that reads the args from stdin, calls it, and prints the result.
 */
export function GoHarnessGenerator(
  signature: ProblemSignature,
  userCode: string,
): string {
  const { functionName, parameters, returnType } = signature;

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
${userCode}

func main() {
	lines := readAllLines()
${inputDecls}
	result := ${functionName}(${argumentList})
${printResult}
}
`;
}

function GoStarterGenerator(signature: ProblemSignature): string {
  const { functionName, parameters, returnType } = signature;

  const paramList = parameters
    .map((p) => `${p.name} ${goDeclFor(p.type)}`)
    .join(", ");

  return `func ${functionName}(${paramList}) ${goDeclFor(returnType)} {

}`;
}

export const goGenerator: Generator = {
  generateSource: GoHarnessGenerator,
  generateStarter: GoStarterGenerator,
};
