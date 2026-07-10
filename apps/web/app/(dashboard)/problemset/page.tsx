"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { FilterBar } from "~/components/problemset/filter-bar";
import { ProblemsTable } from "~/components/problemset/problems-table";
import { ProgressCalendar } from "~/components/problemset/progress-calendar";
import { TablePagination } from "~/components/problemset/table-pagination";
import { TopicChips } from "~/components/problemset/topic-chips";
import { TrendingCompanies } from "~/components/problemset/trending-companies";
import type { ProblemFilters } from "~/components/problemset/types";
import { Skeleton } from "~/components/ui/skeleton";
import { useProblems } from "~/hooks/api/problem";

const DEFAULT_LIMIT = 50;

function readFilters(params: URLSearchParams): ProblemFilters {
  const difficulty = params.get("difficulty");
  const status = params.get("status");
  return {
    search: params.get("search") ?? undefined,
    difficulty: ["easy", "medium", "hard"].includes(difficulty ?? "")
      ? (difficulty as ProblemFilters["difficulty"])
      : undefined,
    status: ["solved", "attempted", "todo"].includes(status ?? "")
      ? (status as ProblemFilters["status"])
      : undefined,
    topicSlug: params.get("topic") ?? undefined,
    limit: Number(params.get("limit")) || DEFAULT_LIMIT,
    offset: Number(params.get("offset")) || 0,
  };
}

/** Mirror the filters into the address bar without triggering a navigation. */
function writeFilters(filters: ProblemFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.difficulty) params.set("difficulty", filters.difficulty);
  if (filters.status) params.set("status", filters.status);
  if (filters.topicSlug) params.set("topic", filters.topicSlug);
  if (filters.limit !== DEFAULT_LIMIT) params.set("limit", String(filters.limit));
  if (filters.offset > 0) params.set("offset", String(filters.offset));

  const query = params.toString();
  window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
}

function ProblemsetContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<ProblemFilters>(() =>
    readFilters(new URLSearchParams(searchParams)),
  );
  const [searchInput, setSearchInput] = useState(filters.search ?? "");

  // Debounce the search box into the applied filters.
  useEffect(() => {
    const handle = setTimeout(() => {
      const search = searchInput.trim() || undefined;
      setFilters((prev) =>
        prev.search === search ? prev : { ...prev, search, offset: 0 },
      );
    }, 300);
    return () => clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    writeFilters(filters);
  }, [filters]);

  const { data, isLoading } = useProblems({
    limit: filters.limit,
    offset: filters.offset,
    difficulty: filters.difficulty,
    status: filters.status,
    topicSlug: filters.topicSlug,
    search: filters.search,
  });

  function patchFilters(patch: Partial<ProblemFilters>) {
    setFilters((prev) => ({ ...prev, offset: 0, ...patch }));
  }

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-4">
        <TopicChips
          activeTopicSlug={filters.topicSlug}
          onTopicChange={(topicSlug) => patchFilters({ topicSlug })}
        />
        <FilterBar
          filters={filters}
          total={data?.total}
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          onDifficultyChange={(difficulty) => patchFilters({ difficulty })}
          onStatusChange={(status) => patchFilters({ status })}
        />
        <ProblemsTable
          problems={data?.problems}
          isLoading={isLoading}
          pageSize={filters.limit}
        />
        <TablePagination
          total={data?.total ?? 0}
          limit={filters.limit}
          offset={filters.offset}
          onOffsetChange={(offset) => setFilters((prev) => ({ ...prev, offset }))}
          onLimitChange={(limit) => patchFilters({ limit })}
        />
      </div>

      <aside className="hidden w-80 shrink-0 space-y-4 lg:block">
        <ProgressCalendar />
        <TrendingCompanies />
      </aside>
    </div>
  );
}

export default function ProblemsetPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <ProblemsetContent />
    </Suspense>
  );
}
