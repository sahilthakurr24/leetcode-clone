import {
  createAuthClient,
  inferAdditionalFields,
  type Auth,
} from "@repo/auth/client";

// No baseURL: the auth routes are served from this same app at /api/auth,
// so the client defaults to the current origin (works in dev and prod).
// `inferAdditionalFields<Auth>` types the app's extra user fields (e.g.
// `username`) on sign-up without importing any server runtime.
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<Auth>()],
});

export const { signIn, signOut, useSession, signUp } = authClient;
