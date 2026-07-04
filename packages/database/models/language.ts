import { pgTable, uuid, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { timestamps } from "./helpers";
import { problemLanguagesTable } from "./problem-language";
import { submissionsTable } from "./submission";

/**
 * Registry of languages we run on Judge0. `judge0Id` is the language id the
 * external Judge0 instance expects; `monacoLanguage` is the editor mode.
 */
export const languagesTable = pgTable("languages", {
  id: uuid("id").primaryKey().defaultRandom(),

  judge0Id: integer("judge0_id").notNull().unique(),

  name: varchar("name", { length: 80 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  monacoLanguage: varchar("monaco_language", { length: 50 }).notNull(),
  version: varchar("version", { length: 40 }),

  isActive: boolean("is_active").default(true).notNull(),

  ...timestamps,
});

export const languagesRelations = relations(languagesTable, ({ many }) => ({
  problemLanguages: many(problemLanguagesTable),
  submissions: many(submissionsTable),
}));

export type SelectLanguage = typeof languagesTable.$inferSelect;
export type InsertLanguage = typeof languagesTable.$inferInsert;
