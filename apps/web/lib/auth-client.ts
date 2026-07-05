import { createAuthClient } from "@repo/auth/client";

// No baseURL: the auth routes are served from this same app at /api/auth,
// so the client defaults to the current origin (works in dev and prod).
export const authClient = createAuthClient();

export const { signIn, signOut, useSession, signUp } = authClient;
