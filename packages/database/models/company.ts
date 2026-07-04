import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { timestamps } from "./helpers";
import { problemsTable } from "./problem";

/** Companies a problem has been asked at (e.g. "Asked at Google"). */
export const companiesTable = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),

  slug: varchar("slug", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  logoUrl: text("logo_url"),

  ...timestamps,
});

export const problemCompaniesTable = pgTable(
  "problem_companies",
  {
    problemId: uuid("problem_id")
      .notNull()
      .references(() => problemsTable.id, { onDelete: "cascade" }),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companiesTable.id, { onDelete: "cascade" }),

    // How often this problem is reported for this company.
    frequency: integer("frequency").default(0).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.problemId, table.companyId] }),
    index("problem_companies_company_idx").on(table.companyId),
  ],
);

export const companiesRelations = relations(companiesTable, ({ many }) => ({
  problems: many(problemCompaniesTable),
}));

export const problemCompaniesRelations = relations(
  problemCompaniesTable,
  ({ one }) => ({
    problem: one(problemsTable, {
      fields: [problemCompaniesTable.problemId],
      references: [problemsTable.id],
    }),
    company: one(companiesTable, {
      fields: [problemCompaniesTable.companyId],
      references: [companiesTable.id],
    }),
  }),
);

export type SelectCompany = typeof companiesTable.$inferSelect;
export type InsertCompany = typeof companiesTable.$inferInsert;
export type SelectProblemCompany = typeof problemCompaniesTable.$inferSelect;
export type InsertProblemCompany = typeof problemCompaniesTable.$inferInsert;
