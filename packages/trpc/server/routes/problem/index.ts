import { problemService } from "../../services";
import { successOutputSchema } from "../../schema";
import { adminProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  listProblemsInputSchema,
  listProblemsOutputSchema,
  getProblemBySlugInputSchema,
  getProblemByIdInputSchema,
  createProblemInputSchema,
  setProblemPublishedInputSchema,
  setProblemPublishedOutputSchema,
  deleteProblemInputSchema,
  problemDetailOutputSchema,
} from "./model";

const TAGS = ["Problem"];
const getPath = generatePath("/problem");

export const problemRouter = router({
  listProblems: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("list"), tags: TAGS } })
    .input(listProblemsInputSchema)
    .output(listProblemsOutputSchema)
    .query(({ input }) => problemService.listProblems(input)),

  getProblemBySlug: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("by-slug/{slug}"), tags: TAGS } })
    .input(getProblemBySlugInputSchema)
    .output(problemDetailOutputSchema)
    .query(({ input }) => problemService.getProblemBySlug(input)),

  getProblemById: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("{id}"), tags: TAGS } })
    .input(getProblemByIdInputSchema)
    .output(problemDetailOutputSchema)
    .query(({ input }) => problemService.getProblemById(input)),

  createProblem: adminProcedure
    .meta({ openapi: { method: "POST", path: getPath("create-problem"), tags: TAGS } })
    .input(createProblemInputSchema)
    .output(problemDetailOutputSchema)
    .mutation(({ ctx, input }) =>
      problemService.createProblem({ ...input, authorId: ctx.userId }),
    ),

  setProblemPublished: adminProcedure
    .meta({ openapi: { method: "POST", path: getPath("set-published"), tags: TAGS } })
    .input(setProblemPublishedInputSchema)
    .output(setProblemPublishedOutputSchema)
    .mutation(({ input }) => problemService.setProblemPublished(input)),

  deleteProblem: adminProcedure
    .meta({ openapi: { method: "POST", path: getPath("delete"), tags: TAGS } })
    .input(deleteProblemInputSchema)
    .output(successOutputSchema)
    .mutation(({ input }) => problemService.deleteProblem(input)),
});
