import { progressService } from "../../services";
import { zodUndefinedModel } from "../../schema";
import { autheticatedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  getProblemStatusInputSchema,
  getProblemStatusOutputSchema,
  getMyProgressOutputSchema,
} from "./model";

const TAGS = ["Progress"];
const getPath = generatePath("/progress");

export const progressRouter = router({
  getMyProgress: autheticatedProcedure
    .meta({ openapi: { method: "GET", path: getPath("mine"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(getMyProgressOutputSchema)
    .query(({ ctx }) => progressService.getUserProgress({ userId: ctx.userId })),

  getProblemStatus: autheticatedProcedure
    .meta({ openapi: { method: "GET", path: getPath("problem-status"), tags: TAGS } })
    .input(getProblemStatusInputSchema)
    .output(getProblemStatusOutputSchema)
    .query(({ ctx, input }) =>
      progressService.getProblemStatus({ ...input, userId: ctx.userId }),
    ),
});
