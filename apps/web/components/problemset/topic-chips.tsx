"use client";

import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { useTopics } from "~/hooks/api/topic";
import { cn } from "~/lib/utils";

interface TopicChipsProps {
  activeTopicSlug: string | undefined;
  onTopicChange: (slug: string | undefined) => void;
}

export function TopicChips({ activeTopicSlug, onTopicChange }: TopicChipsProps) {
  const { data, isLoading } = useTopics();

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-24 shrink-0 rounded-full" />
        ))}
      </div>
    );
  }

  const topics = data?.topics ?? [];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <button onClick={() => onTopicChange(undefined)} className="shrink-0">
        <Badge
          variant={activeTopicSlug ? "secondary" : "default"}
          className="cursor-pointer rounded-full px-3 py-1"
        >
          All Topics
        </Badge>
      </button>
      {topics.map((topic) => {
        const active = topic.slug === activeTopicSlug;
        return (
          <button
            key={topic.id}
            onClick={() => onTopicChange(active ? undefined : topic.slug)}
            className="shrink-0"
          >
            <Badge
              variant={active ? "default" : "secondary"}
              className="cursor-pointer rounded-full px-3 py-1"
            >
              {topic.name}
              <span
                className={cn(
                  "ml-1 text-xs",
                  active ? "text-primary-foreground/70" : "text-muted-foreground",
                )}
              >
                {topic.problemCount}
              </span>
            </Badge>
          </button>
        );
      })}
    </div>
  );
}
