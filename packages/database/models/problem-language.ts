import { pgTable, uuid, text, unique, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { timestamps } from "./helpers";
import { problemsTable } from "./problem";
import { languagesTable } from "./language";

/**
 * Per-language code for a problem.
 * - `starterCode`: shown in the editor as the user's starting point.
 * - `driverCode`: hidden harness that reads stdin, parses the test-case args,
 *   invokes the user's function, and prints the result for Judge0 to compare.
 * - `solutionCode`: optional reference solution.
 */
export const problemLanguagesTable = pgTable(
  "problem_languages",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    problemId: uuid("problem_id")
      .notNull()
      .references(() => problemsTable.id, { onDelete: "cascade" }),
    languageId: uuid("language_id")
      .notNull()
      .references(() => languagesTable.id, { onDelete: "cascade" }),

    starterCode: text("starter_code").notNull(),
    driverCode: text("driver_code").notNull(),
    solutionCode: text("solution_code"),

    ...timestamps,
  },
  (table) => [
    unique("problem_languages_problem_language_uq").on(
      table.problemId,
      table.languageId,
    ),
    index("problem_languages_problem_idx").on(table.problemId),
  ],
);

export const problemLanguagesRelations = relations(
  problemLanguagesTable,
  ({ one }) => ({
    problem: one(problemsTable, {
      fields: [problemLanguagesTable.problemId],
      references: [problemsTable.id],
    }),
    language: one(languagesTable, {
      fields: [problemLanguagesTable.languageId],
      references: [languagesTable.id],
    }),
  }),
);

export type SelectProblemLanguage = typeof problemLanguagesTable.$inferSelect;
export type InsertProblemLanguage = typeof problemLanguagesTable.$inferInsert;
