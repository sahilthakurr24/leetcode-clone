"use client";

import Link from "next/link";
import { CircleCheckBig } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { timeAgo, type RecentAccepted } from "./types";

export function RecentAcceptedCard({
  submissions,
}: {
  submissions: RecentAccepted | undefined;
}) {
  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-sm">Recent Accepted</CardTitle>
      </CardHeader>
      <CardContent className="px-2">
        {!submissions || submissions.length === 0 ? (
          <p className="px-2 pb-1 text-xs text-muted-foreground">
            No accepted submissions yet.
          </p>
        ) : (
          <ul>
            {submissions.map((submission) => (
              <li key={submission.id}>
                <Link
                  href={`/problems/${submission.problemSlug}`}
                  className="flex items-center gap-3 rounded-md px-2 py-2.5 text-sm odd:bg-muted/40 hover:bg-muted"
                >
                  <CircleCheckBig className="size-4 shrink-0 text-emerald-400" />
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {submission.problemTitle}
                  </span>
                  <Badge variant="secondary" className="rounded-full font-normal">
                    {submission.language}
                  </Badge>
                  <span className="w-24 shrink-0 text-right text-xs text-muted-foreground">
                    {timeAgo(submission.createdAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
