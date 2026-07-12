import { z } from "zod";

export const createSubmissionInputSchema = z.object({
  userId: z.string().describe("Id of the submitting user"),
  problemId: z.string().describe("Id of the problem"),
  languageSlug: z.string().describe("Slug of the language (e.g. cpp)"),
  sourceCode: z.string().min(1).describe("The user's solution code"),
});

export type CreateSubmissionInputType = z.infer<
  typeof createSubmissionInputSchema
>;

export const runSampleTestsInputSchema = createSubmissionInputSchema;

export type RunSampleTestsInputType = z.infer<
  typeof runSampleTestsInputSchema
>;

export const getSubmissionByIdInputSchema = z.object({
  id: z.string().describe("Id of the submission"),
  userId: z.string().describe("Id of the requesting user"),
});

export type GetSubmissionByIdInputType = z.infer<
  typeof getSubmissionByIdInputSchema
>;

export const getUserSubmissionActivityInputSchema = z.object({
  username: z.string().min(1).describe("Username of the user"),
});

export type GetUserSubmissionActivityInputType = z.infer<
  typeof getUserSubmissionActivityInputSchema
>;

export const listRecentAcceptedInputSchema = z.object({
  username: z.string().min(1).describe("Username of the user"),
  limit: z.number().int().min(1).max(50).default(15),
});

export type ListRecentAcceptedInputType = z.infer<
  typeof listRecentAcceptedInputSchema
>;

export const listUserSubmissionsInputSchema = z.object({
  userId: z.string().describe("Id of the user"),
  problemId: z.string().optional().describe("Filter by problem"),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export type ListUserSubmissionsInputType = z.infer<
  typeof listUserSubmissionsInputSchema
>;
