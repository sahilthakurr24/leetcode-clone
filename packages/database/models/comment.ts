import {
  pgTable,
  uuid,
  text,
  integer,
  smallint,
  primaryKey,
  index,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { timestamps } from "./helpers";
import { usersTable } from "./user";
import { problemsTable } from "./problem";
import { solutionsTable } from "./solution";

/**
 * Threaded discussion comment. Attached to either a problem or a solution
 * (exactly one of problemId / solutionId is set); `parentId` threads replies.
 */
export const commentsTable = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    problemId: uuid("problem_id").references(() => problemsTable.id, {
      onDelete: "cascade",
    }),
    solutionId: uuid("solution_id").references(() => solutionsTable.id, {
      onDelete: "cascade",
    }),
    parentId: uuid("parent_id").references((): AnyPgColumn => commentsTable.id, {
      onDelete: "cascade",
    }),

    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    content: text("content").notNull(),

    upvotes: integer("upvotes").default(0).notNull(),
    downvotes: integer("downvotes").default(0).notNull(),

    ...timestamps,
  },
  (table) => [
    index("comments_problem_idx").on(table.problemId),
    index("comments_solution_idx").on(table.solutionId),
    index("comments_parent_idx").on(table.parentId),
  ],
);

/** One vote per user per comment (value is +1 or -1). */
export const commentVotesTable = pgTable(
  "comment_votes",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    commentId: uuid("comment_id")
      .notNull()
      .references(() => commentsTable.id, { onDelete: "cascade" }),

    value: smallint("value").notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.commentId] })],
);

export const commentsRelations = relations(commentsTable, ({ one, many }) => ({
  author: one(usersTable, {
    fields: [commentsTable.userId],
    references: [usersTable.id],
  }),
  problem: one(problemsTable, {
    fields: [commentsTable.problemId],
    references: [problemsTable.id],
  }),
  solution: one(solutionsTable, {
    fields: [commentsTable.solutionId],
    references: [solutionsTable.id],
  }),
  parent: one(commentsTable, {
    fields: [commentsTable.parentId],
    references: [commentsTable.id],
    relationName: "comment_replies",
  }),
  replies: many(commentsTable, { relationName: "comment_replies" }),
  votes: many(commentVotesTable),
}));

export const commentVotesRelations = relations(
  commentVotesTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [commentVotesTable.userId],
      references: [usersTable.id],
    }),
    comment: one(commentsTable, {
      fields: [commentVotesTable.commentId],
      references: [commentsTable.id],
    }),
  }),
);

export type SelectComment = typeof commentsTable.$inferSelect;
export type InsertComment = typeof commentsTable.$inferInsert;
export type SelectCommentVote = typeof commentVotesTable.$inferSelect;
export type InsertCommentVote = typeof commentVotesTable.$inferInsert;
