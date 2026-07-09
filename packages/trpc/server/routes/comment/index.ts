import { commentService } from "../../services";
import { autheticatedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  listCommentsInputSchema,
  listCommentsOutputSchema,
  createCommentInputSchema,
  createCommentOutputSchema,
  voteCommentInputSchema,
  voteCommentOutputSchema,
} from "./model";

const TAGS = ["Comment"];
const getPath = generatePath("/comment");

export const commentRouter = router({
  listComments: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("list"), tags: TAGS } })
    .input(listCommentsInputSchema)
    .output(listCommentsOutputSchema)
    .query(({ input }) => commentService.listComments(input)),

  createComment: autheticatedProcedure
    .meta({ openapi: { method: "POST", path: getPath("create"), tags: TAGS } })
    .input(createCommentInputSchema)
    .output(createCommentOutputSchema)
    .mutation(({ ctx, input }) =>
      commentService.createComment({ ...input, userId: ctx.userId }),
    ),

  voteComment: autheticatedProcedure
    .meta({ openapi: { method: "POST", path: getPath("vote"), tags: TAGS } })
    .input(voteCommentInputSchema)
    .output(voteCommentOutputSchema)
    .mutation(({ ctx, input }) =>
      commentService.voteComment({ ...input, userId: ctx.userId }),
    ),
});
