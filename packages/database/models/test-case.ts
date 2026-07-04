import {
  pgTable,
  uuid,
  jsonb,
  text,
  boolean,
  integer,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { timestamps } from "./helpers";
import { problemsTable } from "./problem";

/**
 * A single test case for a problem. `input`/`expectedOutput` are stored as
 * language-agnostic JSON (arg values in param order); the backend serializes
 * them into the stdin/expected-stdout Judge0 needs per language.
 * `isSample` cases are the visible examples shown on the problem page.
 */
export const testCasesTable = pgTable(
  "test_cases",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    problemId: uuid("problem_id")
      .notNull()
      .references(() => problemsTable.id, { onDelete: "cascade" }),

    input: jsonb("input").notNull(),
    expectedOutput: jsonb("expected_output").notNull(),

    isSample: boolean("is_sample").default(false).notNull(),
    explanation: text("explanation"),

    position: integer("position").notNull(),

    ...timestamps,
  },
  (table) => [
    unique("test_cases_problem_position_uq").on(
      table.problemId,
      table.position,
    ),
    index("test_cases_problem_idx").on(table.problemId),
  ],
);

export const testCasesRelations = relations(testCasesTable, ({ one }) => ({
  problem: one(problemsTable, {
    fields: [testCasesTable.problemId],
    references: [problemsTable.id],
  }),
}));

export type SelectTestCase = typeof testCasesTable.$inferSelect;
export type InsertTestCase = typeof testCasesTable.$inferInsert;
