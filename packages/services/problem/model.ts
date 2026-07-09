import { z } from "zod";
import { CANONICAL_TYPES } from "@repo/judge0";

/** Language-agnostic signature types (e.g. "int[]"); see @repo/judge0. */
const canonicalTypeSchema = z.enum(CANONICAL_TYPES);

export const listProblemsInputSchema = z.object({
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
});

export type ListProblemsInputType = z.infer<typeof listProblemsInputSchema>;

export const getProblemBySlugInputSchema = z.object({
  slug: z.string().describe("Slug of the problem"),
});

export type GetProblemBySlugInputType = z.infer<typeof getProblemBySlugInputSchema>;

export const getProblemByIdInputSchema = z.object({
  id: z.string().describe("Id of the problem"),
});

export type GetProblemByIdInputType = z.infer<typeof getProblemByIdInputSchema>;

export const createProblemInputSchema = z.object({
  displayId: z.number().int().min(1).describe("Public problem number"),
  slug: z.string().min(1).max(160),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  constraints: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]),

  functionName: z.string().min(1).max(100),
  returnType: canonicalTypeSchema,
  params: z
    .array(
      z.object({
        name: z.string().min(1).max(60),
        type: canonicalTypeSchema,
      }),
    )
    .min(1)
    .describe("Ordered function parameters (position = array index)"),

  testCases: z
    .array(
      z.object({
        input: z.array(z.any()).describe("Arguments in param order"),
        expectedOutput: z.any(),
        isSample: z.boolean().default(false),
        explanation: z.string().optional(),
      }),
    )
    .min(1)
    .describe("Ordered test cases (position = array index)"),

  hints: z.array(z.string().min(1)).default([]),

  starterCodes: z
    .array(
      z.object({
        languageSlug: z.string().min(1),
        starterCode: z.string().min(1),
        solutionCode: z.string().optional(),
      }),
    )
    .default([]),

  timeLimitMs: z.number().int().min(100).max(20000).optional(),
  memoryLimitKb: z.number().int().min(16000).max(1024000).optional(),
  authorId: z.string().describe("Id of the authoring user"),
  isPublished: z.boolean().default(false),
});

export type CreateProblemInputType = z.infer<typeof createProblemInputSchema>;

export const setProblemPublishedInputSchema = z.object({
  id: z.string().describe("Id of the problem"),
  isPublished: z.boolean(),
});

export type SetProblemPublishedInputType = z.infer<typeof setProblemPublishedInputSchema>;

export const deleteProblemInputSchema = z.object({
  id: z.string().describe("Id of the problem"),
});

export type DeleteProblemInputType = z.infer<typeof deleteProblemInputSchema>;
