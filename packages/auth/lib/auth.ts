import { db } from "@repo/database";
import {
  usersTable,
  sessionsTable,
  accountsTable,
  verificationsTable,
} from "@repo/database/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { env } from "../env";

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,

  // Map better-auth's models onto the existing Drizzle tables. Keys are the
  // better-auth model names; the user model reuses the app's `users` table.
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: usersTable,
      session: sessionsTable,
      account: accountsTable,
      verification: verificationsTable,
    },
  }),

  // `users.id` is a Postgres uuid, so let better-auth generate uuids too.
  advanced: {
    database: {
      generateId: "uuid",
    },
  },

  // Map better-auth's user fields to the columns the app already has, and
  // surface the app-specific columns as additional fields. `username` is
  // settable at sign-up; `role` stays server-controlled (never client input).
  user: {
    fields: {
      name: "fullName",
      image: "profileImageUrl",
    },
    additionalFields: {
      username: { type: "string", required: false, input: true },
      role: { type: "string", required: false, input: false },
    },
  },

  emailAndPassword: {
    enabled: true,
  },

  // Keep last: lets better-auth set cookies from Next.js server actions /
  // route handlers.
  plugins: [nextCookies()],
});

export type Auth = typeof auth;
