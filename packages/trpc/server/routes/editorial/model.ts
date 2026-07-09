import z from "zod";

export const getEditorialByProblemIdInputSchema = z.object({
  problemId: z.string().uuid().describe("Id of the problem"),
});

export const getEditorialByProblemIdOutputSchema = z.object({
  editorial: z.object({
    id: z.string().uuid(),
    problemId: z.string().uuid(),
    title: z.string(),
    content: z.string(),
    authorId: z.string().uuid().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
});
