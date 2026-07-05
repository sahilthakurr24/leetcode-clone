import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  boolean,
  text,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { timestamps } from "./helpers";
import { submissionsTable } from "./submission";
import { userProblemStatusTable } from "./progress";
import { solutionsTable } from "./solution";
import { commentsTable } from "./comment";
import { problemListsTable, favoritesTable } from "./list";
import { sessionsTable } from "./session";
import { accountsTable } from "./account";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),

  fullName: varchar("full_name", { length: 80 }).notNull(),
  username: varchar("username", { length: 50 }).unique(),

  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),

  profileImageUrl: text("profile_image_url"),

  role: userRoleEnum("role").default("user").notNull(),

  ...timestamps,
});

export const usersRelations = relations(usersTable, ({ many }) => ({
  submissions: many(submissionsTable),
  problemStatuses: many(userProblemStatusTable),
  solutions: many(solutionsTable),
  comments: many(commentsTable),
  lists: many(problemListsTable),
  favorites: many(favoritesTable),
  sessions: many(sessionsTable),
  accounts: many(accountsTable),
}));

export type SelectUser = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
