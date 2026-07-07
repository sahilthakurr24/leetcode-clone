import { z } from "zod";

export const getUserProgressInputSchema = z.object({
  userId: z.string().describe("Id of the user"),
});

export type GetUserProgressInputType = z.infer<
  typeof getUserProgressInputSchema
>;

export const getProblemStatusInputSchema = z.object({
  userId: z.string().describe("Id of the user"),
  problemId: z.string().describe("Id of the problem"),
});

export type GetProblemStatusInputType = z.infer<
  typeof getProblemStatusInputSchema
>;
