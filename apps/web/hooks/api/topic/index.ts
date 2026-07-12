"use client";

import { trpc } from "~/trpc/client";

export function useTopics() {
  return trpc.topic.listTopics.useQuery();
}

// ---- admin ----

export function useCreateTopic() {
  const utils = trpc.useUtils();

  return trpc.topic.createTopic.useMutation({
    onSuccess: () => utils.topic.listTopics.invalidate(),
  });
}
