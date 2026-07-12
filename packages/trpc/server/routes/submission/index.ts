import { submissionService } from "../../services";
import { autheticatedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  submitInputSchema,
  submitOutputSchema,
  runSamplesOutputSchema,
  getSubmissionByIdInputSchema,
  getSubmissionByIdOutputSchema,
  listMySubmissionsInputSchema,
  listMySubmissionsOutputSchema,
  getUserActivityInputSchema,
  getUserActivityOutputSchema,
  listRecentAcceptedInputSchema,
  listRecentAcceptedOutputSchema,
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

  getUserActivity: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("activity/{username}"), tags: TAGS } })
    .input(getUserActivityInputSchema)
    .output(getUserActivityOutputSchema)
    .query(({ input }) => submissionService.getUserSubmissionActivity(input)),

  listRecentAccepted: publicProcedure
    .meta({
      openapi: { method: "GET", path: getPath("recent-accepted/{username}"), tags: TAGS },
    })
    .input(listRecentAcceptedInputSchema)
    .output(listRecentAcceptedOutputSchema)
    .query(({ input }) => submissionService.listRecentAccepted(input)),

  listMySubmissions: autheticatedProcedure
    .meta({ openapi: { method: "GET", path: getPath("mine"), tags: TAGS } })
    .input(listMySubmissionsInputSchema)
    .output(listMySubmissionsOutputSchema)
    .query(({ ctx, input }) =>
      submissionService.listUserSubmissions({ ...input, userId: ctx.userId }),
    ),
});
