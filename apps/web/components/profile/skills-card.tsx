"use client";

import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { ProfileDetail } from "./types";

const MAX_TOPICS = 10;

export function SkillsCard({ topics }: { topics: ProfileDetail["topics"] }) {
  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-sm">Skills</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        {topics.length === 0 ? (
          <p className="text-xs text-muted-foreground">No problems solved yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {topics.slice(0, MAX_TOPICS).map((topic) => (
              <Badge
                key={topic.slug}
                variant="secondary"
                className="rounded-full px-2.5 py-0.5 font-normal"
              >
                {topic.name}
                <span className="ml-1 text-muted-foreground">×{topic.solved}</span>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
