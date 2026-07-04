import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  smallint,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { timestamps } from "./helpers";
import { problemsTable } from "./problem";
import { usersTable } from "./user";
import { languagesTable } from "./language";

/** A user-shared solution write-up for a problem. */
export const solutionsTable = pgTable(
  "solutions",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    problemId: uuid("problem_id")
      .notNull()
      .references(() => problemsTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    languageId: uuid("language_id").references(() => languagesTable.id, {
      onDelete: "set null",
    }),

    title: varchar("title", { length: 200 }).notNull(),
    content: text("content").notNull(),

    upvotes: integer("upvotes").default(0).notNull(),
    downvotes: integer("downvotes").default(0).notNull(),

    ...timestamps,
  },
  (table) => [index("solutions_problem_idx").on(table.problemId)],
);

/** One vote per user per solution (value is +1 or -1). */
export const solutionVotesTable = pgTable(
  "solution_votes",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    solutionId: uuid("solution_id")
      .notNull()
      .references(() => solutionsTable.id, { onDelete: "cascade" }),

    value: smallint("value").notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.solutionId] })],
);

export const solutionsRelations = relations(
  solutionsTable,
  ({ one, many }) => ({
    problem: one(problemsTable, {
      fields: [solutionsTable.problemId],
      references: [problemsTable.id],
    }),
    author: one(usersTable, {
      fields: [solutionsTable.userId],
      references: [usersTable.id],
    }),
    language: one(languagesTable, {
      fields: [solutionsTable.languageId],
      references: [languagesTable.id],
    }),
    votes: many(solutionVotesTable),
  }),
);

export const solutionVotesRelations = relations(
  solutionVotesTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [solutionVotesTable.userId],
      references: [usersTable.id],
    }),
    solution: one(solutionsTable, {
      fields: [solutionVotesTable.solutionId],
      references: [solutionsTable.id],
    }),
  }),
);

export type SelectSolution = typeof solutionsTable.$inferSelect;
export type InsertSolution = typeof solutionsTable.$inferInsert;
export type SelectSolutionVote = typeof solutionVotesTable.$inferSelect;
export type InsertSolutionVote = typeof solutionVotesTable.$inferInsert;
