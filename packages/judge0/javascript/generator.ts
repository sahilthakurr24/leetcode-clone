import type { Generator, ProblemSignature } from "../types";
import { jsCodecFor } from "../helper/jshelper";
import { JS_HARNESS } from "./template";

/**
 * Assemble the full runnable JavaScript source for a submission:
 *   harness + the user's complete function (verbatim) + a driver that reads
 *   the args from stdin, calls the function, and prints the canonical result.
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
${userCode}

const lines = readAllLines();
${inputDecls}
const result = ${functionName}(${paramNames});
${printResult}
`;
}

function JsStarterGenerator(signature: ProblemSignature): string {
  const { functionName, parameters, returnType } = signature;

  const jsdocParams = parameters
    .map((p) => ` * @param {${p.type}} ${p.name}`)
    .join("\n");
  const paramNames = parameters.map((p) => p.name).join(", ");

  return `/**
${jsdocParams}
 * @return {${returnType}}
 */
var ${functionName} = function(${paramNames}) {

};`;
}

export const jsGenerator: Generator = {
  generateSource: JsHarnessGenerator,
  generateStarter: JsStarterGenerator,
};
