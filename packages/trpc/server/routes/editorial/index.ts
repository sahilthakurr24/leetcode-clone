import { editorialService } from "../../services";
import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  getEditorialByProblemIdInputSchema,
  getEditorialByProblemIdOutputSchema,
} from "./model";

const TAGS = ["Editorial"];
const getPath = generatePath("/editorial");

export const editorialRouter = router({
  getEditorialByProblemId: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("by-problem/{problemId}"), tags: TAGS } })
    .input(getEditorialByProblemIdInputSchema)
    .output(getEditorialByProblemIdOutputSchema)
    .query(({ input }) => editorialService.getEditorialByProblemId(input)),
});
