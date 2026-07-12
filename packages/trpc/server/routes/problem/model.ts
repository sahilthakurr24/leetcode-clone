import z from "zod";
import { CANONICAL_TYPES } from "@repo/judge0";

import { difficultySchema } from "../../schema";

/** Language-agnostic signature types (e.g. "int[]"); see @repo/judge0. */
const canonicalTypeSchema = z.enum(CANONICAL_TYPES);

export const listProblemsInputSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  difficulty: difficultySchema.optional(),
  search: z.string().trim().min(1).max(200).optional().describe("Match title or problem number"),
  topicSlug: z.string().optional().describe("Filter by topic slug"),
  status: z
    .enum(["solved", "attempted", "todo"])
    .optional()
    .describe("Per-user progress filter; requires a session to have any effect"),
});

export const pickRandomInputSchema = listProblemsInputSchema.omit({
  limit: true,
  offset: true,
});

export const listProblemsOutputSchema = z.object({
  problems: z.array(
    z.object({
      id: z.string().uuid(),
      displayId: z.number().int(),
      slug: z.string(),
      title: z.string(),
      difficulty: difficultySchema,
      totalSubmissions: z.number(),
      totalAccepted: z.number(),
      status: z.enum(["solved", "attempted"]).nullable(),
    }),
  ),
  total: z.number().int(),
});

export const pickRandomOutputSchema = z.object({
  slug: z.string().nullable(),
});

export const getProblemBySlugInputSchema = z.object({
  slug: z.string().min(1).describe("Slug of the problem"),
});

export const getProblemByIdInputSchema = z.object({
  id: z.string().uuid().describe("Id of the problem"),
});

export const createProblemInputSchema = z.object({
  displayId: z.number().int().min(1).describe("Public problem number"),
  slug: z.string().min(1).max(160),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  constraints: z.string().optional(),
  difficulty: difficultySchema,

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

  topicIds: z
    .array(z.string().uuid())
    .default([])
    .describe("Ids of topics to tag the problem with"),
  companyIds: z
    .array(z.string().uuid())
    .default([])
    .describe("Ids of companies to tag the problem with"),

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
  isPublished: z.boolean().default(false),
});

export const setProblemPublishedInputSchema = z.object({
  id: z.string().uuid().describe("Id of the problem"),
  isPublished: z.boolean(),
});

export const deleteProblemInputSchema = z.object({
  id: z.string().uuid().describe("Id of the problem"),
});

const problemRowSchema = z.object({
  id: z.string().uuid(),
  displayId: z.number().int(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  constraints: z.string().nullable(),
  difficulty: difficultySchema,
  functionName: z.string(),
  returnType: z.string(),
  timeLimitMs: z.number().int(),
  memoryLimitKb: z.number().int(),
  authorId: z.string().uuid().nullable(),
  isPublished: z.boolean(),
  totalSubmissions: z.number(),
  totalAccepted: z.number(),
  likes: z.number(),
  dislikes: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/** Shape of getProblemDetail — returned by create/getBySlug/getById. */
export const problemDetailOutputSchema = z.object({
  problem: problemRowSchema,

  params: z.array(
    z.object({
      id: z.string().uuid(),
      problemId: z.string().uuid(),
      name: z.string(),
      type: z.string(),
      position: z.number().int(),
    }),
  ),

  sampleTestCases: z.any(),

  hints: z.array(
    z.object({
      id: z.string().uuid(),
      problemId: z.string().uuid(),
      content: z.string(),
      position: z.number().int(),
    }),
  ),

  languages: z.array(
    z.object({
      id: z.string().uuid(),
      starterCode: z.string(),
      language: z.object({
        id: z.string().uuid(),
        judge0Id: z.number().int(),
        name: z.string(),
        slug: z.string(),
        monacoLanguage: z.string(),
        version: z.string().nullable(),
        isActive: z.boolean(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
    }),
  ),
});

export const setProblemPublishedOutputSchema = z.object({
  problem: problemRowSchema,
});
