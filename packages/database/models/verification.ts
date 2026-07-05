import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";

import { timestamps } from "./helpers";

/**
 * better-auth `verification` model — email verification / password reset tokens.
 * Property keys must match better-auth's field names; SQL columns stay
 * snake_case. Consumed via the drizzle adapter `schema.verification` mapping.
 */
export const verificationsTable = pgTable(
  "verifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),

    ...timestamps,
  },
  (table) => [index("verifications_identifier_idx").on(table.identifier)],
);

export type SelectVerification = typeof verificationsTable.$inferSelect;
export type InsertVerification = typeof verificationsTable.$inferInsert;
