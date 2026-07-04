import { timestamp } from "drizzle-orm/pg-core";

/**
 * Reusable created/updated columns. Spread into a table definition to keep
 * timestamp handling consistent across every model:
 *
 *   export const fooTable = pgTable("foo", { id: ..., ...timestamps });
 */
export const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};
