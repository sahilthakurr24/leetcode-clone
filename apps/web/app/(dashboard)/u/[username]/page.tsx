"use client";

import Link from "next/link";
import { use } from "react";

import { ActivityHeatmap } from "~/components/profile/activity-heatmap";
import { LanguagesCard } from "~/components/profile/languages-card";
import { ProfileSidebar } from "~/components/profile/profile-sidebar";
import { RecentAcceptedCard } from "~/components/profile/recent-accepted-card";
import { SkillsCard } from "~/components/profile/skills-card";
import { SolvedStatsCard } from "~/components/profile/solved-stats-card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "~/components/ui/empty";
import { Skeleton } from "~/components/ui/skeleton";
import { useUserProfileByUsername } from "~/hooks/api/auth";
import { useRecentAccepted, useUserActivity } from "~/hooks/api/submission";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const profile = useUserProfileByUsername(username);
  const activity = useUserActivity(username);
  const recent = useRecentAccepted(username);

  if (profile.isLoading) {
    return (
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="w-full space-y-4 lg:w-72">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="flex-1 space-y-4">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (profile.isError || !profile.data) {
    return (
      <Empty className="h-[60vh] border border-dashed">
        <EmptyHeader>
          <EmptyTitle>User not found</EmptyTitle>
          <EmptyDescription>
            No user goes by @{username}.{" "}
            <Link href="/problemset" className="text-blue-400 hover:underline">
              Back to problems
            </Link>
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const { user, stats, languages, topics } = profile.data;

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <aside className="w-full shrink-0 space-y-4 lg:w-72">
        <ProfileSidebar user={user} />
        <LanguagesCard languages={languages} />
        <SkillsCard topics={topics} />
      </aside>

      <div className="min-w-0 flex-1 space-y-4">
        <SolvedStatsCard stats={stats} />
        <ActivityHeatmap data={activity.data} />
        <RecentAcceptedCard submissions={recent.data?.submissions} />
      </div>
    </div>
  );
}
