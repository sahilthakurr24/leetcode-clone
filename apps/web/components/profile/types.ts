import type { RouterOutputs } from "@repo/trpc/client";

export type ProfileDetail = RouterOutputs["auth"]["getUserProfileByUsername"];
export type ActivityData = RouterOutputs["submission"]["getUserActivity"];
export type RecentAccepted =
  RouterOutputs["submission"]["listRecentAccepted"]["submissions"];

const TIME_STEPS: [seconds: number, label: string][] = [
  [60 * 60 * 24 * 365, "year"],
  [60 * 60 * 24 * 30, "month"],
  [60 * 60 * 24, "day"],
  [60 * 60, "hour"],
  [60, "minute"],
];

/** "3 minutes ago" style label without pulling in a date library. */
export function timeAgo(date: Date | string): string {
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(date).getTime()) / 1000),
  );

  for (const [step, label] of TIME_STEPS) {
    if (seconds >= step) {
      const value = Math.floor(seconds / step);
      return `${value} ${label}${value === 1 ? "" : "s"} ago`;
    }
  }
  return "just now";
}
