import { z } from "zod";

export const listSolutionsInputSchema = z.object({
  problemId: z.string().describe("Id of the problem"),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export type ListSolutionsInputType = z.infer<typeof listSolutionsInputSchema>;

export const getSolutionByIdInputSchema = z.object({
  id: z.string().describe("Id of the solution"),
});

export type GetSolutionByIdInputType = z.infer<
  typeof getSolutionByIdInputSchema
>;

export const createSolutionInputSchema = z.object({
  problemId: z.string().describe("Id of the problem"),
  userId: z.string().describe("Id of the author"),
  languageId: z.string().optional().describe("Id of the language"),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
});

export type CreateSolutionInputType = z.infer<
  typeof createSolutionInputSchema
>;

export const voteSolutionInputSchema = z.object({
  solutionId: z.string().describe("Id of the solution"),
  userId: z.string().describe("Id of the voter"),
  value: z.union([z.literal(1), z.literal(-1)]),
});

export type VoteSolutionInputType = z.infer<typeof voteSolutionInputSchema>;
