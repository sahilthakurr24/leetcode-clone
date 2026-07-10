import type { Generator, ProblemSignature } from "../types";
import { codecFor, cppDeclFor, cppStarterParamFor } from "../helper/cpphelper";
import { CPP_HARNESS } from "./template";

/**
 * Assemble the full, compilable C++ source for a submission:
 *   includes + harness + the user's complete `Solution` class (verbatim) +
 *   `main()` that reads the args from stdin, calls the method, and prints the
 *   canonical result. Per-type read/dump logic lives in helper/cpphelper.ts.
 */
export function CppHarnessGenerator(
  signature: ProblemSignature,
  userCode: string,
): string {
  const { functionName, parameters, returnType } = signature;

  const argumentList = parameters.map((p) => p.name).join(", ");

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
${userCode}

int main() {
    std::vector<std::string> lines = readAllLines();
${inputDecls}
    auto result = Solution().${functionName}(${argumentList});
${printResult}
    return 0;
}
`;
}

function CppStarterGenerator(signature: ProblemSignature): string {
  const { functionName, parameters, returnType } = signature;

  const paramList = parameters
    .map((p) => `${cppStarterParamFor(p.type)} ${p.name}`)
    .join(", ");

  return `class Solution {
public:
    ${cppDeclFor(returnType)} ${functionName}(${paramList}) {

    }
};`;
}

export const cppGenerator: Generator = {
  generateSource: CppHarnessGenerator,
  generateStarter: CppStarterGenerator,
};
