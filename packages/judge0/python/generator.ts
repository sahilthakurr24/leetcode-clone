import type { Generator, ProblemSignature } from "../types";
import { pythonCodecFor, pythonDeclFor } from "../helper/pythonhelper";
import { PYTHON_HARNESS } from "./template";

/**
 * Assemble the full runnable Python source for a submission:
 *   harness + the user's complete `class Solution` (verbatim) + a driver that
 *   reads the args from stdin, calls `Solution().<fn>(...)`, and prints the
 *   canonical result.
 */
export function PythonHarnessGenerator(
  signature: ProblemSignature,
  userCode: string,
): string {
  const { functionName, parameters, returnType } = signature;

  const paramNames = parameters.map((p) => p.name).join(", ");

  const inputDecls = parameters
    .map(
      (p, idx) =>
        `${p.name} = ${pythonCodecFor(p.type).read(`lines[${idx}]`)}`,
    )
    .join("\n");

  const printResult = `sys.stdout.write(${pythonCodecFor(returnType).dump("result")})`;

  return `${PYTHON_HARNESS}

${userCode}

lines = read_all_lines()
${inputDecls}
result = Solution().${functionName}(${paramNames})
${printResult}
`;
}

function PythonStarterGenerator(signature: ProblemSignature): string {
  const { functionName, parameters, returnType } = signature;

  const paramList = parameters
    .map((p) => `${p.name}: ${pythonDeclFor(p.type)}`)
    .join(", ");

  return `class Solution:
    def ${functionName}(self${paramList ? ", " + paramList : ""}) -> ${pythonDeclFor(returnType)}:
        `;
}

export const pythonGenerator: Generator = {
  generateSource: PythonHarnessGenerator,
  generateStarter: PythonStarterGenerator,
};
