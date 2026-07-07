import { z } from "zod";

export const listCommentsInputSchema = z
  .object({
    problemId: z.string().optional().describe("Id of the problem"),
    solutionId: z.string().optional().describe("Id of the solution"),
    limit: z.number().int().min(1).max(100).default(50),
    offset: z.number().int().min(0).default(0),
  })
  .refine((input) => !!input.problemId !== !!input.solutionId, {
    message: "Provide exactly one of problemId or solutionId",
  });

export type ListCommentsInputType = z.infer<typeof listCommentsInputSchema>;

export const createCommentInputSchema = z
  .object({
    userId: z.string().describe("Id of the author"),
    problemId: z.string().optional().describe("Id of the problem"),
    solutionId: z.string().optional().describe("Id of the solution"),
    parentId: z.string().optional().describe("Id of the parent comment"),
    content: z.string().min(1),
  })
  .refine((input) => !!input.problemId !== !!input.solutionId, {
    message: "Provide exactly one of problemId or solutionId",
  });

export type CreateCommentInputType = z.infer<typeof createCommentInputSchema>;

export const voteCommentInputSchema = z.object({
  commentId: z.string().describe("Id of the comment"),
  userId: z.string().describe("Id of the voter"),
  value: z.union([z.literal(1), z.literal(-1)]),
});

export type VoteCommentInputType = z.infer<typeof voteCommentInputSchema>;
