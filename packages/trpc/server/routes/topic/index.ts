import z from "zod";

import { topicService } from "../../services";
import { zodUndefinedModel } from "../../schema";
import { publicProcedure, router } from "../../trpc";
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

export const topicRouter = router({
  listTopics: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("list"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(listTopicsOutputSchema)
    .query(() => topicService.listTopics()),
});
