import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { usersTable } from "./user";
import { timestamps } from "./helpers";

/**
 * better-auth `session` model. Property keys (token, expiresAt, ipAddress,
 * userAgent, userId) must match better-auth's field names; SQL columns stay
 * snake_case. Consumed via the drizzle adapter `schema.session` mapping.
 */
export const sessionsTable = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),

    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),

    ...timestamps,
  },
  (table) => [index("sessions_user_idx").on(table.userId)],
);

export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [sessionsTable.userId],
    references: [usersTable.id],
  }),
}));

export type SelectSession = typeof sessionsTable.$inferSelect;
export type InsertSession = typeof sessionsTable.$inferInsert;
