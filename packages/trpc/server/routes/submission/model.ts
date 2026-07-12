import z from "zod";

import { submissionStatusSchema } from "../../schema";

export const submitInputSchema = z.object({
  problemId: z.string().uuid().describe("Id of the problem"),
  languageSlug: z.string().min(1).describe("Slug of the language (e.g. cpp)"),
  sourceCode: z.string().min(1).describe("The user's solution code"),
});

export const getSubmissionByIdInputSchema = z.object({
  id: z.string().uuid().describe("Id of the submission"),
});

export const getUserActivityInputSchema = z.object({
  username: z.string().min(1).describe("Username of the user"),
});

export const getUserActivityOutputSchema = z.object({
  activity: z.array(
    z.object({
      date: z.string(),
      count: z.number().int(),
    }),
  ),
  totalPastYear: z.number().int(),
});

export const listRecentAcceptedInputSchema = z.object({
  username: z.string().min(1).describe("Username of the user"),
  limit: z.coerce.number().int().min(1).max(50).default(15),
});

export const listRecentAcceptedOutputSchema = z.object({
  submissions: z.array(
    z.object({
      id: z.string().uuid(),
      createdAt: z.date(),
      language: z.string(),
      problemTitle: z.string(),
      problemSlug: z.string(),
    }),
  ),
});

export const listMySubmissionsInputSchema = z.object({
  problemId: z.string().uuid().optional().describe("Filter by problem"),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

const submissionRowSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  problemId: z.string().uuid(),
  languageId: z.string().uuid(),
  sourceCode: z.string(),
  status: submissionStatusSchema,
  runtimeMs: z.number().int().nullable(),
  memoryKb: z.number().int().nullable(),
  passedTestCases: z.number().int(),
  totalTestCases: z.number().int().nullable(),
  errorMessage: z.string().nullable(),
  createdAt: z.date(),
});

export const submitOutputSchema = z.object({
  submission: submissionRowSchema.optional(),
  results: z.array(
    z.object({
      submissionId: z.string().uuid(),
      testCaseId: z.string().uuid().nullable(),
      status: submissionStatusSchema,
      stdout: z.string().nullable(),
      stderr: z.string().nullable(),
      timeMs: z.number().int().nullable(),
      memoryKb: z.number().int().nullable(),
      judge0Token: z.string(),
    }),
  ),
});

export const runSamplesOutputSchema = z.object({
  results: z.array(
    z.object({
      testCaseId: z.string().uuid().nullable(),
      input: z.any(),
      expectedOutput: z.any(),
      status: submissionStatusSchema,
      stdout: z.string().nullable(),
      stderr: z.string().nullable(),
      timeMs: z.number().int().nullable(),
      memoryKb: z.number().int().nullable(),
    }),
  ),
});

export const getSubmissionByIdOutputSchema = z.object({
  submission: submissionRowSchema,
  results: z.array(
    z.object({
      id: z.string().uuid(),
      submissionId: z.string().uuid(),
      testCaseId: z.string().uuid().nullable(),
      status: submissionStatusSchema,
      stdout: z.string().nullable(),
      stderr: z.string().nullable(),
      timeMs: z.number().int().nullable(),
      memoryKb: z.number().int().nullable(),
      judge0Token: z.string().nullable(),
      createdAt: z.date(),
    }),
  ),
});

export const listMySubmissionsOutputSchema = z.object({
  submissions: z.array(
    z.object({
      id: z.string().uuid(),
      problemId: z.string().uuid(),
      status: submissionStatusSchema,
      runtimeMs: z.number().int().nullable(),
      memoryKb: z.number().int().nullable(),
      passedTestCases: z.number().int(),
      totalTestCases: z.number().int().nullable(),
      createdAt: z.date(),
      language: z.string(),
      problemTitle: z.string(),
      problemSlug: z.string(),
    }),
  ),
});
