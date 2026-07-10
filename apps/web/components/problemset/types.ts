export interface ProblemFilters {
  search: string | undefined;
  difficulty: "easy" | "medium" | "hard" | undefined;
  status: "solved" | "attempted" | "todo" | undefined;
  topicSlug: string | undefined;
  limit: number;
  offset: number;
}
