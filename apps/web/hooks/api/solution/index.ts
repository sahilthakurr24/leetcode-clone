"use client";

import type { RouterInputs } from "@repo/trpc/client";
import { trpc } from "~/trpc/client";

export function useSolutions(
  input: Omit<RouterInputs["solution"]["listSolutions"], "problemId"> & {
    problemId: string | undefined;
  },
) {
  const { problemId, ...rest } = input;
  return trpc.solution.listSolutions.useQuery(
    { ...rest, problemId: problemId! },
    { enabled: !!problemId },
  );
}

export function useSolutionById(id: string | undefined) {
  return trpc.solution.getSolutionById.useQuery({ id: id! }, { enabled: !!id });
}

export function useCreateSolution() {
  const utils = trpc.useUtils();

  return trpc.solution.createSolution.useMutation({
    onSuccess: (_data, variables) =>
      utils.solution.listSolutions.invalidate({
        problemId: variables.problemId,
      }),
  });
}

export function useVoteSolution() {
  const utils = trpc.useUtils();

  return trpc.solution.voteSolution.useMutation({
    onSuccess: async (data) => {
      await Promise.all([
        utils.solution.getSolutionById.invalidate({ id: data.solution.id }),
        utils.solution.listSolutions.invalidate({
          problemId: data.solution.problemId,
        }),
      ]);
    },
  });
}
