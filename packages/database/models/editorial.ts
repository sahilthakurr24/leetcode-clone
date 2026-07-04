import { pgTable, uuid, varchar, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { timestamps } from "./helpers";
import { problemsTable } from "./problem";
import { usersTable } from "./user";

/** Official editorial for a problem (one per problem). */
export const editorialsTable = pgTable("editorials", {
  id: uuid("id").primaryKey().defaultRandom(),

  problemId: uuid("problem_id")
    .notNull()
    .unique()
    .references(() => problemsTable.id, { onDelete: "cascade" }),

  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),

  authorId: uuid("author_id").references(() => usersTable.id, {
    onDelete: "set null",
  }),

  ...timestamps,
});

export const editorialsRelations = relations(editorialsTable, ({ one }) => ({
  problem: one(problemsTable, {
    fields: [editorialsTable.problemId],
    references: [problemsTable.id],
  }),
  author: one(usersTable, {
    fields: [editorialsTable.authorId],
    references: [usersTable.id],
  }),
}));

export type SelectEditorial = typeof editorialsTable.$inferSelect;
export type InsertEditorial = typeof editorialsTable.$inferInsert;
