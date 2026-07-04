import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  varchar,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { usersTable } from "./user";
import { problemsTable } from "./problem";
import { languagesTable } from "./language";
import { testCasesTable } from "./test-case";

/** Verdict for a whole submission or an individual test case. */
export const submissionStatusEnum = pgEnum("submission_status", [
  "pending",
  "judging",
  "accepted",
  "wrong_answer",
  "time_limit_exceeded",
  "memory_limit_exceeded",
  "output_limit_exceeded",
  "runtime_error",
  "compilation_error",
  "internal_error",
]);

export const submissionsTable = pgTable(
  "submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    problemId: uuid("problem_id")
      .notNull()
      .references(() => problemsTable.id, { onDelete: "cascade" }),
    languageId: uuid("language_id")
      .notNull()
      .references(() => languagesTable.id, { onDelete: "restrict" }),

    sourceCode: text("source_code").notNull(),

    status: submissionStatusEnum("status").default("pending").notNull(),

    // Aggregate stats across all test cases (worst/peak values).
    runtimeMs: integer("runtime_ms"),
    memoryKb: integer("memory_kb"),
    passedTestCases: integer("passed_test_cases").default(0).notNull(),
    totalTestCases: integer("total_test_cases"),

    errorMessage: text("error_message"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("submissions_user_problem_idx").on(table.userId, table.problemId),
    index("submissions_problem_idx").on(table.problemId),
  ],
);

/** Per-test-case result of a submission, one row per Judge0 run. */
export const submissionResultsTable = pgTable(
  "submission_results",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    submissionId: uuid("submission_id")
      .notNull()
      .references(() => submissionsTable.id, { onDelete: "cascade" }),
    testCaseId: uuid("test_case_id").references(() => testCasesTable.id, {
      onDelete: "set null",
    }),

    status: submissionStatusEnum("status").notNull(),

    stdout: text("stdout"),
    stderr: text("stderr"),
    timeMs: integer("time_ms"),
    memoryKb: integer("memory_kb"),

    judge0Token: varchar("judge0_token", { length: 64 }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("submission_results_submission_idx").on(table.submissionId),
  ],
);

export const submissionsRelations = relations(
  submissionsTable,
  ({ one, many }) => ({
    user: one(usersTable, {
      fields: [submissionsTable.userId],
      references: [usersTable.id],
    }),
    problem: one(problemsTable, {
      fields: [submissionsTable.problemId],
      references: [problemsTable.id],
    }),
    language: one(languagesTable, {
      fields: [submissionsTable.languageId],
      references: [languagesTable.id],
    }),
    results: many(submissionResultsTable),
  }),
);

export const submissionResultsRelations = relations(
  submissionResultsTable,
  ({ one }) => ({
    submission: one(submissionsTable, {
      fields: [submissionResultsTable.submissionId],
      references: [submissionsTable.id],
    }),
    testCase: one(testCasesTable, {
      fields: [submissionResultsTable.testCaseId],
      references: [testCasesTable.id],
    }),
  }),
);

export type SelectSubmission = typeof submissionsTable.$inferSelect;
export type InsertSubmission = typeof submissionsTable.$inferInsert;
export type SelectSubmissionResult = typeof submissionResultsTable.$inferSelect;
export type InsertSubmissionResult = typeof submissionResultsTable.$inferInsert;
