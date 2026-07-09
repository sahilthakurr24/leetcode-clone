import z from "zod";

import { publicAuthorSchema } from "../../schema";

export const listSolutionsInputSchema = z.object({
  problemId: z.string().uuid().describe("Id of the problem"),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const getSolutionByIdInputSchema = z.object({
  id: z.string().uuid().describe("Id of the solution"),
});

export const createSolutionInputSchema = z.object({
  problemId: z.string().uuid().describe("Id of the problem"),
  languageId: z.string().uuid().optional().describe("Id of the language"),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
});

export const voteSolutionInputSchema = z.object({
  solutionId: z.string().uuid().describe("Id of the solution"),
  value: z.union([z.literal(1), z.literal(-1)]),
});

const solutionRowSchema = z.object({
  id: z.string().uuid(),
  problemId: z.string().uuid(),
  userId: z.string().uuid(),
  languageId: z.string().uuid().nullable(),
  title: z.string(),
  content: z.string(),
  upvotes: z.number().int(),
  downvotes: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const listSolutionsOutputSchema = z.object({
  solutions: z.array(
    z.object({
      id: z.string().uuid(),
      title: z.string(),
      upvotes: z.number().int(),
      downvotes: z.number().int(),
      createdAt: z.date(),
      author: publicAuthorSchema,
      language: z.string().nullable(),
    }),
  ),
});

export const getSolutionByIdOutputSchema = z.object({
  solution: solutionRowSchema,
});

export const createSolutionOutputSchema = z.object({
  solution: solutionRowSchema.optional(),
});
