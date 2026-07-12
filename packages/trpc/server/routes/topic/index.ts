import z from "zod";

import { topicService } from "../../services";
import { zodUndefinedModel } from "../../schema";
import { adminProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Topic"];
const getPath = generatePath("/topic");

export const listTopicsOutputSchema = z.object({
  topics: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      slug: z.string(),
      createdAt: z.date(),
      updatedAt: z.date(),
      problemCount: z.number().int(),
    }),
  ),
});

export const createTopicInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Lowercase letters, numbers and dashes"),
});

export const createTopicOutputSchema = z.object({
  topic: z.object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
});

export const topicRouter = router({
  listTopics: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("list"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(listTopicsOutputSchema)
    .query(() => topicService.listTopics()),

  createTopic: adminProcedure
    .meta({ openapi: { method: "POST", path: getPath("create"), tags: TAGS } })
    .input(createTopicInputSchema)
    .output(createTopicOutputSchema)
    .mutation(({ input }) => topicService.createTopic(input)),
});
