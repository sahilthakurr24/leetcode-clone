"use client";

import { trpc } from "~/trpc/client";

/** All solved/attempted problems for the signed-in user. */
export function useMyProgress() {
  return trpc.progress.getMyProgress.useQuery();
}

/** Solved/attempted status of one problem for the signed-in user. */
export function useProblemStatus(problemId: string | undefined) {
  return trpc.progress.getProblemStatus.useQuery(
    { problemId: problemId! },
    { enabled: !!problemId },
  );
}
