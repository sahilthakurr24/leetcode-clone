import { z } from "zod";

export const zodUndefinedModel = z.undefined().describe("undefined");

// Shared building blocks reused across route models.
export const difficultySchema = z.enum(["easy", "medium", "hard"]);

export const submissionStatusSchema = z.enum([
  "pending",
  "judging",
  "accepted",
  "wrong_answer",
  "time_limit_exceeded",
  "memory_limit_exceeded",
  "output_limit_exceeded",
  "runtime_error",
  "compilation_error",
  "internal_error",
]);

/** Author fields exposed publicly on solutions/comments. */
export const publicAuthorSchema = z.object({
  id: z.string().uuid(),
  username: z.string().nullable(),
  profileImageUrl: z.string().nullable(),
});

export const successOutputSchema = z.object({ success: z.boolean() });

export { z };
