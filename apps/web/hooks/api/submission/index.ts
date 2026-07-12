"use client";

import type { RouterInputs } from "@repo/trpc/client";
import { trpc } from "~/trpc/client";

/** Judged submission against all test cases; refreshes progress + history. */
export function useSubmit() {
  const utils = trpc.useUtils();

  return trpc.submission.submit.useMutation({
    onSuccess: async (_data, variables) => {
      await Promise.all([
        utils.submission.listMySubmissions.invalidate(),
        utils.progress.getMyProgress.invalidate(),
        utils.progress.getProblemStatus.invalidate({
          problemId: variables.problemId,
        }),
      ]);
    },
  });
}

/** Run against visible sample test cases only (LeetCode's "Run" button). */
export function useRunSamples() {
  return trpc.submission.runSamples.useMutation();
}

export function useSubmissionById(id: string | undefined) {
  return trpc.submission.getSubmissionById.useQuery(
    { id: id! },
    { enabled: !!id },
  );
}

export function useMySubmissions(
  input?: RouterInputs["submission"]["listMySubmissions"],
) {
  return trpc.submission.listMySubmissions.useQuery(input ?? {});
}

/** Per-day submission counts for the past year (profile heatmap). */
export function useUserActivity(username: string | undefined) {
  return trpc.submission.getUserActivity.useQuery(
    { username: username! },
    { enabled: !!username },
  );
}

/** Latest accepted submissions for a public profile. */
export function useRecentAccepted(username: string | undefined) {
  return trpc.submission.listRecentAccepted.useQuery(
    { username: username! },
    { enabled: !!username },
  );
}
