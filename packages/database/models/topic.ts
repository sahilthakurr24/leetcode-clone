import { pgTable, uuid, varchar, primaryKey, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { timestamps } from "./helpers";
import { problemsTable } from "./problem";

/** Problem topics / tags (e.g. Array, Dynamic Programming, Graph). */
export const topicsTable = pgTable("topics", {
  id: uuid("id").primaryKey().defaultRandom(),

  slug: varchar("slug", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 80 }).notNull(),

  ...timestamps,
});

export const problemTopicsTable = pgTable(
  "problem_topics",
  {
    problemId: uuid("problem_id")
      .notNull()
      .references(() => problemsTable.id, { onDelete: "cascade" }),
    topicId: uuid("topic_id")
      .notNull()
      .references(() => topicsTable.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.problemId, table.topicId] }),
    index("problem_topics_topic_idx").on(table.topicId),
  ],
);

export const topicsRelations = relations(topicsTable, ({ many }) => ({
  problems: many(problemTopicsTable),
}));

export const problemTopicsRelations = relations(
  problemTopicsTable,
  ({ one }) => ({
    problem: one(problemsTable, {
      fields: [problemTopicsTable.problemId],
      references: [problemsTable.id],
    }),
    topic: one(topicsTable, {
      fields: [problemTopicsTable.topicId],
      references: [topicsTable.id],
    }),
  }),
);

export type SelectTopic = typeof topicsTable.$inferSelect;
export type InsertTopic = typeof topicsTable.$inferInsert;
export type SelectProblemTopic = typeof problemTopicsTable.$inferSelect;
export type InsertProblemTopic = typeof problemTopicsTable.$inferInsert;
