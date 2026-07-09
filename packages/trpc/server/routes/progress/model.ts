import z from "zod";

import { difficultySchema } from "../../schema";

export const getProblemStatusInputSchema = z.object({
  problemId: z.string().uuid().describe("Id of the problem"),
});

const problemStatusRowSchema = z.object({
  userId: z.string().uuid(),
  problemId: z.string().uuid(),
  status: z.enum(["attempted", "solved"]),
  lastSubmissionId: z.string().uuid().nullable(),
  solvedAt: z.date().nullable(),
  updatedAt: z.date(),
});

export const getMyProgressOutputSchema = z.object({
  progress: z.array(
    z.object({
      problemId: z.string().uuid(),
      status: z.enum(["attempted", "solved"]),
      solvedAt: z.date().nullable(),
      updatedAt: z.date(),
      slug: z.string(),
      title: z.string(),
      difficulty: difficultySchema,
    }),
  ),
});

export const getProblemStatusOutputSchema = z.object({
  status: problemStatusRowSchema.nullable(),
});
