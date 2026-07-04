import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  integer,
  bigint,
  boolean,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { timestamps } from "./helpers";
import { usersTable } from "./user";
import { problemLanguagesTable } from "./problem-language";
import { testCasesTable } from "./test-case";
import { problemTopicsTable } from "./topic";
import { problemCompaniesTable } from "./company";
import { submissionsTable } from "./submission";
import { editorialsTable } from "./editorial";
import { solutionsTable } from "./solution";
import { commentsTable } from "./comment";

export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);

/**
 * A coding problem. Uses the function-signature (LeetCode-style) model:
 * the user implements `functionName` returning `returnType`, taking the
 * ordered params in `problemParamsTable`. Per-language starter + hidden driver
 * code lives in `problemLanguagesTable`.
 */
export const problemsTable = pgTable(
  "problems",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    displayId: integer("display_id").notNull().unique(),
    slug: varchar("slug", { length: 160 }).notNull().unique(),
    title: varchar("title", { length: 200 }).notNull(),

    description: text("description").notNull(),
    constraints: text("constraints"),

    difficulty: difficultyEnum("difficulty").notNull(),

    functionName: varchar("function_name", { length: 100 }).notNull(),
    returnType: varchar("return_type", { length: 60 }).notNull(),

    timeLimitMs: integer("time_limit_ms").default(2000).notNull(),
    memoryLimitKb: integer("memory_limit_kb").default(256000).notNull(),

    authorId: uuid("author_id").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    isPublished: boolean("is_published").default(false).notNull(),

    // Denormalized counters for list views / acceptance rate.
    totalSubmissions: bigint("total_submissions", { mode: "number" })
      .default(0)
      .notNull(),
    totalAccepted: bigint("total_accepted", { mode: "number" })
      .default(0)
      .notNull(),
    likes: bigint("likes", { mode: "number" }).default(0).notNull(),
    dislikes: bigint("dislikes", { mode: "number" }).default(0).notNull(),

    ...timestamps,
  },
  (table) => [index("problems_difficulty_idx").on(table.difficulty)],
);

/** Ordered parameters of the problem's function signature. */
export const problemParamsTable = pgTable(
  "problem_params",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    problemId: uuid("problem_id")
      .notNull()
      .references(() => problemsTable.id, { onDelete: "cascade" }),

    name: varchar("name", { length: 60 }).notNull(),
    type: varchar("type", { length: 60 }).notNull(),
    position: integer("position").notNull(),
  },
  (table) => [
    unique("problem_params_problem_position_uq").on(
      table.problemId,
      table.position,
    ),
    index("problem_params_problem_idx").on(table.problemId),
  ],
);

/** Ordered hints revealed to the user one at a time. */
export const problemHintsTable = pgTable(
  "problem_hints",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    problemId: uuid("problem_id")
      .notNull()
      .references(() => problemsTable.id, { onDelete: "cascade" }),

    content: text("content").notNull(),
    position: integer("position").notNull(),
  },
  (table) => [
    unique("problem_hints_problem_position_uq").on(
      table.problemId,
      table.position,
    ),
    index("problem_hints_problem_idx").on(table.problemId),
  ],
);

export const problemsRelations = relations(problemsTable, ({ one, many }) => ({
  author: one(usersTable, {
    fields: [problemsTable.authorId],
    references: [usersTable.id],
  }),
  params: many(problemParamsTable),
  hints: many(problemHintsTable),
  languages: many(problemLanguagesTable),
  testCases: many(testCasesTable),
  topics: many(problemTopicsTable),
  companies: many(problemCompaniesTable),
  submissions: many(submissionsTable),
  editorial: one(editorialsTable),
  solutions: many(solutionsTable),
  comments: many(commentsTable),
}));

export const problemParamsRelations = relations(
  problemParamsTable,
  ({ one }) => ({
    problem: one(problemsTable, {
      fields: [problemParamsTable.problemId],
      references: [problemsTable.id],
    }),
  }),
);

export const problemHintsRelations = relations(problemHintsTable, ({ one }) => ({
  problem: one(problemsTable, {
    fields: [problemHintsTable.problemId],
    references: [problemsTable.id],
  }),
}));

export type SelectProblem = typeof problemsTable.$inferSelect;
export type InsertProblem = typeof problemsTable.$inferInsert;
export type SelectProblemParam = typeof problemParamsTable.$inferSelect;
export type InsertProblemParam = typeof problemParamsTable.$inferInsert;
export type SelectProblemHint = typeof problemHintsTable.$inferSelect;
export type InsertProblemHint = typeof problemHintsTable.$inferInsert;
