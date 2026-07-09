import { submissionService } from "../../services";
import { autheticatedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  submitInputSchema,
  submitOutputSchema,
  runSamplesOutputSchema,
  getSubmissionByIdInputSchema,
  getSubmissionByIdOutputSchema,
  listMySubmissionsInputSchema,
  listMySubmissionsOutputSchema,
} from "./model";

const TAGS = ["Submission"];
const getPath = generatePath("/submission");

export const submissionRouter = router({
  submit: autheticatedProcedure
    .meta({ openapi: { method: "POST", path: getPath("submit"), tags: TAGS } })
    .input(submitInputSchema)
    .output(submitOutputSchema)
    .mutation(({ ctx, input }) =>
      submissionService.createSubmission({ ...input, userId: ctx.userId }),
    ),

  runSamples: autheticatedProcedure
    .meta({ openapi: { method: "POST", path: getPath("run-samples"), tags: TAGS } })
    .input(submitInputSchema)
    .output(runSamplesOutputSchema)
    .mutation(({ ctx, input }) =>
      submissionService.runSampleTests({ ...input, userId: ctx.userId }),
    ),

  getSubmissionById: autheticatedProcedure
    .meta({ openapi: { method: "GET", path: getPath("{id}"), tags: TAGS } })
    .input(getSubmissionByIdInputSchema)
    .output(getSubmissionByIdOutputSchema)
    .query(({ ctx, input }) =>
      submissionService.getSubmissionById({ ...input, userId: ctx.userId }),
    ),

  listMySubmissions: autheticatedProcedure
    .meta({ openapi: { method: "GET", path: getPath("mine"), tags: TAGS } })
    .input(listMySubmissionsInputSchema)
    .output(listMySubmissionsOutputSchema)
    .query(({ ctx, input }) =>
      submissionService.listUserSubmissions({ ...input, userId: ctx.userId }),
    ),
});
