import type { Generator, ProblemSignature } from "../types";
import { codecFor } from "../helper/cpphelper";
import { CPP_HARNESS } from "./template";

/**
 * Assemble the full, compilable C++ source for a submission:
 *   includes + harness + `Solution` class (user body) + `main()` that reads the
 *   args from stdin, calls the method, and prints the canonical result.
 * Per-type read/dump logic lives in helper/cpphelper.ts; the C++ runtime it
 * calls lives in ./template.ts.
 */
export function CppHarnessGenerator(
  signature: ProblemSignature,
  userCode: string,
): string {
  const { functionName, parameters, returnType } = signature;

  const parameterList = parameters
    .map((p) => `${p.type} ${p.name}`)
    .join(", ");
  const argumentList = parameters.map((p) => p.name).join(", ");

  const solutionClass = `class Solution {
public:
    ${returnType} ${functionName}(${parameterList}) {
        ${userCode}
    }
};`;

  const inputDecls = parameters
    .map(
      (p, idx) =>
        `    auto ${p.name} = ${codecFor(p.type).read(`lines[${idx}]`)};`,
    )
    .join("\n");

  const printResult = `    std::cout << ${codecFor(returnType).dump("result")};`;

  return `#include <bits/stdc++.h>
using namespace std;
${CPP_HARNESS}
${solutionClass}

int main() {
    std::vector<std::string> lines = readAllLines();
${inputDecls}
    auto result = Solution().${functionName}(${argumentList});
${printResult}
    return 0;
}
`;
}

export const cppGenerator: Generator = {
  generateSource: CppHarnessGenerator,
};
