import { pgTable, uuid, date, boolean, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { usersTable } from "./user";
import { timestamps } from "./helpers";

/**
 * One row per (user, day) marking daily solve activity — the source for streak
 * / activity-calendar views. `solved` is true once the user solved a problem
 * that day.
 */
export const attendanceTable = pgTable(
  "attendance",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    attendanceDate: date("attendance_date").notNull(),

    solved: boolean("solved").notNull().default(false),

    ...timestamps,
  },
  (table) => [
    uniqueIndex("attendance_user_date_idx").on(table.userId, table.attendanceDate),
  ],
);

export const attendanceRelations = relations(attendanceTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [attendanceTable.userId],
    references: [usersTable.id],
  }),
}));

export type SelectAttendance = typeof attendanceTable.$inferSelect;
export type InsertAttendance = typeof attendanceTable.$inferInsert;
