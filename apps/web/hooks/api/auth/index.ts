"use client";

import type { RouterInputs } from "@repo/trpc/client";
import { trpc } from "~/trpc/client";

/** Current session user (full private row); errors with UNAUTHORIZED when signed out. */
export function useMe() {
  return trpc.auth.me.useQuery(undefined, { retry: false });
}

export function useUserByUsername(username: string | undefined) {
  return trpc.auth.getUserByUsername.useQuery({ username: username! }, { enabled: !!username });
}

export function useIsUsernameAvailable(username: string | undefined) {
  return trpc.auth.isUsernameAvailable.useQuery(
    { username: username! },
    { enabled: !!username && username.length >= 3 },
  );
}

/** Public profile + solved/submission stats. */
export function useUserProfile(id: string | undefined) {
  return trpc.auth.getUserProfile.useQuery({ id: id! }, { enabled: !!id });
}

/** Full public profile (stats + languages + topics) for /u/[username]. */
export function useUserProfileByUsername(username: string | undefined) {
  return trpc.auth.getUserProfileByUsername.useQuery(
    { username: username! },
    { enabled: !!username, retry: false },
  );
}

export function useUpdateUser() {
  const utils = trpc.useUtils();

  return trpc.auth.updateMyProfile.useMutation({
    onSuccess: async (data) => {
      await Promise.all([
        utils.auth.me.invalidate(),
        utils.auth.getUserProfile.invalidate({ id: data.user.id }),
        utils.auth.getUserByUsername.invalidate(),
      ]);
    },
  });
}

export function useDeleteMyAccount() {
  return trpc.auth.deleteMyAccount.useMutation();
}

// ---- admin ----

export function useUsers(input?: RouterInputs["auth"]["listUsers"]) {
  return trpc.auth.listUsers.useQuery(input ?? {});
}

export function useUpdateUserRole() {
  const utils = trpc.useUtils();

  return trpc.auth.updateUserRole.useMutation({
    onSuccess: () => utils.auth.listUsers.invalidate(),
  });
}

export function useDeleteUser() {
  const utils = trpc.useUtils();

  return trpc.auth.deleteUser.useMutation({
    onSuccess: () => utils.auth.listUsers.invalidate(),
  });
}
