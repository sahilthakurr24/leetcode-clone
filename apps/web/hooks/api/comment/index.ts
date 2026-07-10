"use client";

import type { RouterInputs } from "@repo/trpc/client";
import { trpc } from "~/trpc/client";

/** Comments for a problem OR a solution — pass exactly one id. */
export function useComments(input: RouterInputs["comment"]["listComments"]) {
  return trpc.comment.listComments.useQuery(input, {
    enabled: !!input.problemId || !!input.solutionId,
  });
}

export function useCreateComment() {
  const utils = trpc.useUtils();

  return trpc.comment.createComment.useMutation({
    onSuccess: (_data, variables) =>
      utils.comment.listComments.invalidate({
        problemId: variables.problemId,
        solutionId: variables.solutionId,
      }),
  });
}

export function useVoteComment() {
  const utils = trpc.useUtils();

  return trpc.comment.voteComment.useMutation({
    onSuccess: () => utils.comment.listComments.invalidate(),
  });
}
