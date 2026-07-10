"use client";

import { trpc } from "~/trpc/client";

/** The signed-in user's per-day solve activity (errors with UNAUTHORIZED when signed out). */
export function useMyAttendance() {
  return trpc.attendance.getMyAttendance.useQuery(undefined, { retry: false });
}
