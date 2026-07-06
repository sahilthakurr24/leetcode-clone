import type { Generator, ProblemSignature } from "../types";
import { javaCodecFor } from "../helper/javahelper";
import { JAVA_HARNESS } from "./template";

/**
 * Assemble the full runnable Java source for a submission. Judge0 expects a
 * public class named `Main`; the harness + a `Solution` inner class (user body)
 * + `main()` all live inside it.
 *
 * NOTE: not verified against a local JDK (none installed) — validate on Judge0.
 */
export function JavaHarnessGenerator(
  signature: ProblemSignature,
  userCode: string,
): string {
  const { functionName, parameters, returnType } = signature;

  const parameterList = parameters
    .map((p) => `${p.type} ${p.name}`)
    .join(", ");
  const argumentList = parameters.map((p) => p.name).join(", ");

  const inputDecls = parameters
    .map(
      (p, idx) =>
        `        ${p.type} ${p.name} = ${javaCodecFor(p.type).read(`lines[${idx}]`)};`,
    )
    .join("\n");

  const printResult = `        System.out.print(${javaCodecFor(returnType).dump("result")});`;

  return `import java.util.*;
import java.io.*;

public class Main {
${JAVA_HARNESS}
    static class Solution {
        public ${returnType} ${functionName}(${parameterList}) {
${userCode}
        }
    }

    public static void main(String[] args) throws IOException {
        String[] lines = readAllLines();
${inputDecls}
        ${returnType} result = new Solution().${functionName}(${argumentList});
${printResult}
    }
}
`;
}

export const javaGenerator: Generator = {
  generateSource: JavaHarnessGenerator,
};
