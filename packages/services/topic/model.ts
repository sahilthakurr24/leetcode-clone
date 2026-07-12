import { z } from "zod";

export const listTopicsInputSchema = z.object({});

export type ListTopicsInputType = z.infer<typeof listTopicsInputSchema>;

export const createTopicInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Lowercase letters, numbers and dashes"),
});

export type CreateTopicInputType = z.infer<typeof createTopicInputSchema>;
