"use client";

import { trpc } from "~/trpc/client";

export function useEditorial(problemId: string | undefined) {
  return trpc.editorial.getEditorialByProblemId.useQuery(
    { problemId: problemId! },
    { enabled: !!problemId },
  );
}
