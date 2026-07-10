"use client";

import type { RouterInputs } from "@repo/trpc/client";
import { trpc } from "~/trpc/client";

export function useProblems(input?: RouterInputs["problem"]["listProblems"]) {
  return trpc.problem.listProblems.useQuery(input ?? {}, {
    // Keep the previous page visible while the next one loads.
    placeholderData: (previous) => previous,
  });
}

export function useProblemBySlug(slug: string | undefined) {
  return trpc.problem.getProblemBySlug.useQuery(
    { slug: slug! },
    { enabled: !!slug },
  );
}

export function useProblemById(id: string | undefined) {
  return trpc.problem.getProblemById.useQuery({ id: id! }, { enabled: !!id });
}

// ---- admin ----

export function useCreateProblem() {
  const utils = trpc.useUtils();

  return trpc.problem.createProblem.useMutation({
    onSuccess: () => utils.problem.listProblems.invalidate(),
  });
}

export function useSetProblemPublished() {
  const utils = trpc.useUtils();

  return trpc.problem.setProblemPublished.useMutation({
    onSuccess: async (data) => {
      await Promise.all([
        utils.problem.listProblems.invalidate(),
        utils.problem.getProblemBySlug.invalidate({ slug: data.problem.slug }),
        utils.problem.getProblemById.invalidate({ id: data.problem.id }),
      ]);
    },
  });
}

export function useDeleteProblem() {
  const utils = trpc.useUtils();

  return trpc.problem.deleteProblem.useMutation({
    onSuccess: () => utils.problem.listProblems.invalidate(),
  });
}
