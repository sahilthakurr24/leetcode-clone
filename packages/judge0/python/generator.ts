import type { Generator, ProblemSignature } from "../types";
import { pythonCodecFor } from "../helper/pythonhelper";
import { PYTHON_HARNESS } from "./template";

/** Indent every non-empty line so the user body sits inside `def fn(...):`. */
function indent(code: string, spaces: number): string {
  const pad = " ".repeat(spaces);
  return code
    .split("\n")
    .map((line) => (line.trim() === "" ? "" : pad + line))
    .join("\n");
}

/**
 * Assemble the full runnable Python source for a submission:
 *   harness + `def fn(params):` wrapping the user body + a driver that reads the
 *   args from stdin, calls the function, and prints the canonical result.
 */
export function PythonHarnessGenerator(
  signature: ProblemSignature,
  userCode: string,
): string {
  const { functionName, parameters, returnType } = signature;

  const paramNames = parameters.map((p) => p.name).join(", ");
  const body = indent(userCode, 4);

  const inputDecls = parameters
    .map(
      (p, idx) =>
        `${p.name} = ${pythonCodecFor(p.type).read(`lines[${idx}]`)}`,
    )
    .join("\n");

  const printResult = `sys.stdout.write(${pythonCodecFor(returnType).dump("result")})`;

  return `${PYTHON_HARNESS}

def ${functionName}(${paramNames}):
${body}

lines = read_all_lines()
${inputDecls}
result = ${functionName}(${paramNames})
${printResult}
`;
}

export const pythonGenerator: Generator = {
  generateSource: PythonHarnessGenerator,
};
