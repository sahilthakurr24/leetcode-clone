import { solutionService } from "../../services";
import { autheticatedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  listSolutionsInputSchema,
  listSolutionsOutputSchema,
  getSolutionByIdInputSchema,
  getSolutionByIdOutputSchema,
  createSolutionInputSchema,
  createSolutionOutputSchema,
  voteSolutionInputSchema,
} from "./model";

const TAGS = ["Solution"];
const getPath = generatePath("/solution");

export const solutionRouter = router({
  listSolutions: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("list"), tags: TAGS } })
    .input(listSolutionsInputSchema)
    .output(listSolutionsOutputSchema)
    .query(({ input }) => solutionService.listSolutions(input)),

  getSolutionById: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("{id}"), tags: TAGS } })
    .input(getSolutionByIdInputSchema)
    .output(getSolutionByIdOutputSchema)
    .query(({ input }) => solutionService.getSolutionById(input)),

  createSolution: autheticatedProcedure
    .meta({ openapi: { method: "POST", path: getPath("create"), tags: TAGS } })
    .input(createSolutionInputSchema)
    .output(createSolutionOutputSchema)
    .mutation(({ ctx, input }) =>
      solutionService.createSolution({ ...input, userId: ctx.userId }),
    ),

  voteSolution: autheticatedProcedure
    .meta({ openapi: { method: "POST", path: getPath("vote"), tags: TAGS } })
    .input(voteSolutionInputSchema)
    .output(getSolutionByIdOutputSchema)
    .mutation(({ ctx, input }) =>
      solutionService.voteSolution({ ...input, userId: ctx.userId }),
    ),
});
