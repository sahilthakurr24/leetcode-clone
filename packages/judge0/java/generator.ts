import type { Generator, ProblemSignature } from "../types";
import { javaCodecFor, javaDeclFor } from "../helper/javahelper";
import { JAVA_HARNESS } from "./template";

/**
 * Assemble the full runnable Java source for a submission. Judge0 expects a
 * public class named `Main` (harness + driver); the user's complete
 * `class Solution` is emitted as a separate top-level class in the same file.
 */
export function JavaHarnessGenerator(
  signature: ProblemSignature,
  userCode: string,
): string {
  const { functionName, parameters, returnType } = signature;

  const argumentList = parameters.map((p) => p.name).join(", ");

  const inputDecls = parameters
    .map(
      (p, idx) =>
        `        ${javaDeclFor(p.type)} ${p.name} = ${javaCodecFor(p.type).read(`lines[${idx}]`)};`,
    )
    .join("\n");

  const printResult = `        System.out.print(${javaCodecFor(returnType).dump("result")});`;

  return `import java.util.*;
import java.io.*;

${userCode}

public class Main {
${JAVA_HARNESS}
    public static void main(String[] args) throws IOException {
        String[] lines = readAllLines();
${inputDecls}
        ${javaDeclFor(returnType)} result = new Solution().${functionName}(${argumentList});
${printResult}
    }
}
`;
}

function JavaStarterGenerator(signature: ProblemSignature): string {
  const { functionName, parameters, returnType } = signature;

  const paramList = parameters
    .map((p) => `${javaDeclFor(p.type)} ${p.name}`)
    .join(", ");

  return `class Solution {
    public ${javaDeclFor(returnType)} ${functionName}(${paramList}) {

    }
}`;
}

export const javaGenerator: Generator = {
  generateSource: JavaHarnessGenerator,
  generateStarter: JavaStarterGenerator,
};
