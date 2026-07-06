import type { Generator, ProblemSignature } from "../types";
import { jsCodecFor } from "../helper/jshelper";
import { JS_HARNESS } from "./template";

/**
 * Assemble the full runnable JavaScript source for a submission:
 *   harness + `function fn(params) { userCode }` + a driver that reads the args
 *   from stdin, calls the function, and prints the canonical result.
 */
export function JsHarnessGenerator(
  signature: ProblemSignature,
  userCode: string,
): string {
  const { functionName, parameters, returnType } = signature;

  const paramNames = parameters.map((p) => p.name).join(", ");

  const inputDecls = parameters
    .map(
      (p, idx) =>
        `const ${p.name} = ${jsCodecFor(p.type).read(`lines[${idx}]`)};`,
    )
    .join("\n");

  const printResult = `process.stdout.write(${jsCodecFor(returnType).dump("result")});`;

  return `${JS_HARNESS}
function ${functionName}(${paramNames}) {
${userCode}
}

const lines = readAllLines();
${inputDecls}
const result = ${functionName}(${paramNames});
${printResult}
`;
}

export const jsGenerator: Generator = {
  generateSource: JsHarnessGenerator,
};
