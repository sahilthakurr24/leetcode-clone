import { db, eq, and, desc, sql } from "@repo/database";
import {
  commentsTable,
  commentVotesTable,
  usersTable,
} from "@repo/database/schema";
import {
  listCommentsInputSchema,
  ListCommentsInputType,
  createCommentInputSchema,
  CreateCommentInputType,
  voteCommentInputSchema,
  VoteCommentInputType,
} from "./model";

class CommentService {
  public async listComments(payload: ListCommentsInputType) {
    const { problemId, solutionId, limit, offset } =
      await listCommentsInputSchema.parseAsync(payload);

    const target = problemId
      ? eq(commentsTable.problemId, problemId)
      : eq(commentsTable.solutionId, solutionId!);

    const comments = await db
      .select({
        id: commentsTable.id,
        parentId: commentsTable.parentId,
        content: commentsTable.content,
        upvotes: commentsTable.upvotes,
        downvotes: commentsTable.downvotes,
        createdAt: commentsTable.createdAt,
        author: {
          id: usersTable.id,
          username: usersTable.username,
          profileImageUrl: usersTable.profileImageUrl,
        },
      })
      .from(commentsTable)
      .innerJoin(usersTable, eq(commentsTable.userId, usersTable.id))
      .where(target)
      .orderBy(desc(commentsTable.createdAt))
      .limit(limit)
      .offset(offset);

    return { comments };
  }

  public async createComment(payload: CreateCommentInputType) {
    const { userId, problemId, solutionId, parentId, content } =
      await createCommentInputSchema.parseAsync(payload);

    const [comment] = await db
      .insert(commentsTable)
      .values({ userId, problemId, solutionId, parentId, content })
      .returning();

    return { comment };
  }

  public async voteComment(payload: VoteCommentInputType) {
    const { commentId, userId, value } =
      await voteCommentInputSchema.parseAsync(payload);

    const [existing] = await db
      .select()
      .from(commentVotesTable)
      .where(
        and(
          eq(commentVotesTable.commentId, commentId),
          eq(commentVotesTable.userId, userId),
        ),
      );

    if (existing && existing.value === value) {
      throw new Error("Already voted");
    }

    if (existing) {
      await db
        .update(commentVotesTable)
        .set({ value })
        .where(
          and(
            eq(commentVotesTable.commentId, commentId),
            eq(commentVotesTable.userId, userId),
          ),
        );
    } else {
      await db.insert(commentVotesTable).values({ commentId, userId, value });
    }

    // Adjust denormalized counters: +1 on the new side, -1 on the old side
    // when the user flipped an existing vote.
    const upDelta = (value === 1 ? 1 : 0) - (existing?.value === 1 ? 1 : 0);
    const downDelta = (value === -1 ? 1 : 0) - (existing?.value === -1 ? 1 : 0);

    const [comment] = await db
      .update(commentsTable)
      .set({
        upvotes: sql`${commentsTable.upvotes} + ${upDelta}`,
        downvotes: sql`${commentsTable.downvotes} + ${downDelta}`,
      })
      .where(eq(commentsTable.id, commentId))
      .returning();

    if (!comment) {
      throw new Error("Comment not found");
    }

    return { comment };
  }
}

export default CommentService;
