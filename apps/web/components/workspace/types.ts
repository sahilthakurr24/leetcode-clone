import type { RouterOutputs } from "@repo/trpc/client";

export type ProblemDetail = RouterOutputs["problem"]["getProblemBySlug"];
export type ProblemRow = ProblemDetail["problem"];
export type ProblemParam = ProblemDetail["params"][number];
export type ProblemLanguage = ProblemDetail["languages"][number];

/** `sampleTestCases` is typed loosely (jsonb) on the wire; this is its real shape. */
export interface SampleTestCase {
  id: string;
  input: unknown[];
  expectedOutput: unknown;
  explanation: string | null;
  position: number;
}

export function getSampleTestCases(detail: ProblemDetail): SampleTestCase[] {
  return (detail.sampleTestCases ?? []) as SampleTestCase[];
}

/** Zip ordered params with a testcase's input values → "nums = [2,7,11]" lines. */
export function formatInput(params: ProblemParam[], input: unknown[]): string[] {
  return params.map((param, i) => `${param.name} = ${JSON.stringify(input[i])}`);
}

export type RunResults = RouterOutputs["submission"]["runSamples"];
export type SubmitResult = RouterOutputs["submission"]["submit"];
