import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  primaryKey,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { timestamps } from "./helpers";
import { usersTable } from "./user";
import { problemsTable } from "./problem";

/** A user-created, orderable collection of problems (study plan / playlist). */
export const problemListsTable = pgTable(
  "problem_lists",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    name: varchar("name", { length: 120 }).notNull(),
    description: text("description"),
    isPublic: boolean("is_public").default(false).notNull(),

    ...timestamps,
  },
  (table) => [index("problem_lists_user_idx").on(table.userId)],
);

export const problemListItemsTable = pgTable(
  "problem_list_items",
  {
    listId: uuid("list_id")
      .notNull()
      .references(() => problemListsTable.id, { onDelete: "cascade" }),
    problemId: uuid("problem_id")
      .notNull()
      .references(() => problemsTable.id, { onDelete: "cascade" }),

    position: integer("position").notNull(),
    addedAt: timestamp("added_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.listId, table.problemId] }),
    unique("problem_list_items_list_position_uq").on(
      table.listId,
      table.position,
    ),
  ],
);

/** Simple bookmark: a user favoriting a problem. */
export const favoritesTable = pgTable(
  "favorites",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    problemId: uuid("problem_id")
      .notNull()
      .references(() => problemsTable.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.problemId] }),
    index("favorites_problem_idx").on(table.problemId),
  ],
);

export const problemListsRelations = relations(
  problemListsTable,
  ({ one, many }) => ({
    user: one(usersTable, {
      fields: [problemListsTable.userId],
      references: [usersTable.id],
    }),
    items: many(problemListItemsTable),
  }),
);

export const problemListItemsRelations = relations(
  problemListItemsTable,
  ({ one }) => ({
    list: one(problemListsTable, {
      fields: [problemListItemsTable.listId],
      references: [problemListsTable.id],
    }),
    problem: one(problemsTable, {
      fields: [problemListItemsTable.problemId],
      references: [problemsTable.id],
    }),
  }),
);

export const favoritesRelations = relations(favoritesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [favoritesTable.userId],
    references: [usersTable.id],
  }),
  problem: one(problemsTable, {
    fields: [favoritesTable.problemId],
    references: [problemsTable.id],
  }),
}));

export type SelectProblemList = typeof problemListsTable.$inferSelect;
export type InsertProblemList = typeof problemListsTable.$inferInsert;
export type SelectProblemListItem = typeof problemListItemsTable.$inferSelect;
export type InsertProblemListItem = typeof problemListItemsTable.$inferInsert;
export type SelectFavorite = typeof favoritesTable.$inferSelect;
export type InsertFavorite = typeof favoritesTable.$inferInsert;
