"use client";

import { trpc } from "~/trpc/client";

export function useTopics() {
  return trpc.topic.listTopics.useQuery();
}
