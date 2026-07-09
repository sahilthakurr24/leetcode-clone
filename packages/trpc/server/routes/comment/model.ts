import z from "zod";

import { publicAuthorSchema } from "../../schema";

export const listCommentsInputSchema = z
  .object({
    problemId: z.string().uuid().optional().describe("Id of the problem"),
    solutionId: z.string().uuid().optional().describe("Id of the solution"),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    offset: z.coerce.number().int().min(0).default(0),
  })
  .refine((input) => !!input.problemId !== !!input.solutionId, {
    message: "Provide exactly one of problemId or solutionId",
  });

export const createCommentInputSchema = z
  .object({
    problemId: z.string().uuid().optional().describe("Id of the problem"),
    solutionId: z.string().uuid().optional().describe("Id of the solution"),
    parentId: z.string().uuid().optional().describe("Id of the parent comment"),
    content: z.string().min(1),
  })
  .refine((input) => !!input.problemId !== !!input.solutionId, {
    message: "Provide exactly one of problemId or solutionId",
  });

export const voteCommentInputSchema = z.object({
  commentId: z.string().uuid().describe("Id of the comment"),
  value: z.union([z.literal(1), z.literal(-1)]),
});

const commentRowSchema = z.object({
  id: z.string().uuid(),
  problemId: z.string().uuid().nullable(),
  solutionId: z.string().uuid().nullable(),
  parentId: z.string().uuid().nullable(),
  userId: z.string().uuid(),
  content: z.string(),
  upvotes: z.number().int(),
  downvotes: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const listCommentsOutputSchema = z.object({
  comments: z.array(
    z.object({
      id: z.string().uuid(),
      parentId: z.string().uuid().nullable(),
      content: z.string(),
      upvotes: z.number().int(),
      downvotes: z.number().int(),
      createdAt: z.date(),
      author: publicAuthorSchema,
    }),
  ),
});

export const createCommentOutputSchema = z.object({
  comment: commentRowSchema.optional(),
});

export const voteCommentOutputSchema = z.object({
  comment: commentRowSchema,
});
