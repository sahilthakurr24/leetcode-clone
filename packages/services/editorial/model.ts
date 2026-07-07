import { z } from "zod";

export const getEditorialByProblemIdInputSchema = z.object({
  problemId: z.string().describe("Id of the problem"),
});

export type GetEditorialByProblemIdInputType = z.infer<
  typeof getEditorialByProblemIdInputSchema
>;
