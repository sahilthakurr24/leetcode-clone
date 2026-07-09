import { languageService } from "../../services";
import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { listLanguagesInputSchema, listLanguagesOutputSchema } from "./model";

const TAGS = ["Language"];
const getPath = generatePath("/language");

export const languageRouter = router({
  listLanguages: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("list"), tags: TAGS } })
    .input(listLanguagesInputSchema)
    .output(listLanguagesOutputSchema)
    .query(({ input }) => languageService.listLanguages(input)),
});
