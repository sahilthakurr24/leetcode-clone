import type { Generator, ProblemSignature } from "../types";
import { cParamDesc, cReturnDesc } from "../helper/chelper";
import { C_HARNESS } from "./template";

/**
 * Assemble the full runnable C source for a submission. Follows the
 * size-parameter convention: array params carry a size, array returns add a
 * trailing `int* returnSize`. The user's complete function is emitted verbatim
 * between the harness and `main()`.
 *
 * v1 supports scalars, strings (char*), int arrays, and TreeNode / ListNode
 * pointers. 2D arrays throw UnsupportedTypeError.
 */
export function CHarnessGenerator(
  signature: ProblemSignature,
  userCode: string,
): string {
  const { functionName, parameters, returnType } = signature;

  const params = parameters.map((p) => cParamDesc(p.type, p.name));
  const ret = cReturnDesc(returnType);

  const callArgs = params.map((p) => p.callArg).join(", ") + ret.extraCallArg;

  const readStmts = params
    .map((param, idx) => `    ${param.readStmt(`g_lines[${idx}]`)}`)
    .join("\n");

  const emitBlock = ret
    .emit(`${functionName}(${callArgs})`)
    .split("\n")
    .map((line) => `    ${line}`)
    .join("\n");

  return `${C_HARNESS}
${userCode}

int main(void) {
    read_all_lines();
${readStmts}
${emitBlock}
    return 0;
}
`;
}

function CStarterGenerator(signature: ProblemSignature): string {
  const { functionName, parameters, returnType } = signature;

  const params = parameters.map((p) => cParamDesc(p.type, p.name));
  const ret = cReturnDesc(returnType);
  const paramDecls = params.map((p) => p.paramDecl).join(", ") + ret.extraParamDecl;

  return `${ret.retType} ${functionName}(${paramDecls}) {

}`;
}

export const cGenerator: Generator = {
  generateSource: CHarnessGenerator,
  generateStarter: CStarterGenerator,
};
