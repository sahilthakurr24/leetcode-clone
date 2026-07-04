import {
  pgTable,
  pgEnum,
  uuid,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { usersTable } from "./user";
import { problemsTable } from "./problem";
import { submissionsTable } from "./submission";

export const problemProgressEnum = pgEnum("problem_progress", [
  "attempted",
  "solved",
]);

/**
 * Denormalized per-user problem status for fast "solved / attempted" lists,
 * one row per (user, problem). Derivable from submissions but kept here so
 * problem listings don't have to scan submission history.
 */
export const userProblemStatusTable = pgTable(
  "user_problem_status",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    problemId: uuid("problem_id")
      .notNull()
      .references(() => problemsTable.id, { onDelete: "cascade" }),

    status: problemProgressEnum("status").notNull(),

    lastSubmissionId: uuid("last_submission_id").references(
      () => submissionsTable.id,
      { onDelete: "set null" },
    ),
    solvedAt: timestamp("solved_at"),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.problemId] }),
  ],
);

export const userProblemStatusRelations = relations(
  userProblemStatusTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [userProblemStatusTable.userId],
      references: [usersTable.id],
    }),
    problem: one(problemsTable, {
      fields: [userProblemStatusTable.problemId],
      references: [problemsTable.id],
    }),
    lastSubmission: one(submissionsTable, {
      fields: [userProblemStatusTable.lastSubmissionId],
      references: [submissionsTable.id],
    }),
  }),
);

export type SelectUserProblemStatus =
  typeof userProblemStatusTable.$inferSelect;
export type InsertUserProblemStatus =
  typeof userProblemStatusTable.$inferInsert;
