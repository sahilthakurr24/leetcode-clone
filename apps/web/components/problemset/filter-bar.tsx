"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Search, Shuffle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useMe } from "~/hooks/api/auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { trpc } from "~/trpc/client";
import type { ProblemFilters } from "./types";

interface FilterBarProps {
  filters: ProblemFilters;
  total: number | undefined;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onDifficultyChange: (value: ProblemFilters["difficulty"]) => void;
  onStatusChange: (value: ProblemFilters["status"]) => void;
}

export function FilterBar({
  filters,
  total,
  searchInput,
  onSearchInputChange,
  onDifficultyChange,
  onStatusChange,
}: FilterBarProps) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [picking, setPicking] = useState(false);
  const { data: me } = useMe();
  const isAdmin = me?.user.role === "admin";

  async function handlePickOne() {
    setPicking(true);
    try {
      const { slug } = await utils.problem.pickRandom.fetch({
        search: filters.search,
        difficulty: filters.difficulty,
        status: filters.status,
        topicSlug: filters.topicSlug,
      });
      if (slug) {
        router.push(`/problems/${slug}`);
      } else {
        toast.info("No problem matches the current filters.");
      }
    } finally {
      setPicking(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-48 flex-1">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(e) => onSearchInputChange(e.target.value)}
          placeholder="Search questions"
          className="h-9 rounded-full bg-secondary pl-8"
        />
      </div>

      <Select
        value={filters.difficulty ?? "all"}
        onValueChange={(v) =>
          onDifficultyChange(v === "all" ? undefined : (v as ProblemFilters["difficulty"]))
        }
      >
        <SelectTrigger className="h-9 w-32 rounded-full bg-secondary">
          <SelectValue placeholder="Difficulty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Difficulty</SelectItem>
          <SelectItem value="easy">
            <span className="text-teal-400">Easy</span>
          </SelectItem>
          <SelectItem value="medium">
            <span className="text-yellow-400">Medium</span>
          </SelectItem>
          <SelectItem value="hard">
            <span className="text-red-400">Hard</span>
          </SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.status ?? "all"}
        onValueChange={(v) =>
          onStatusChange(v === "all" ? undefined : (v as ProblemFilters["status"]))
        }
      >
        <SelectTrigger className="h-9 w-32 rounded-full bg-secondary">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Status</SelectItem>
          <SelectItem value="todo">Todo</SelectItem>
          <SelectItem value="solved">Solved</SelectItem>
          <SelectItem value="attempted">Attempted</SelectItem>
        </SelectContent>
      </Select>

      <Button
        size="sm"
        variant="secondary"
        className="h-9 rounded-full text-emerald-400 hover:text-emerald-300"
        onClick={handlePickOne}
        disabled={picking}
      >
        <Shuffle className="size-4" /> Pick One
      </Button>

      {isAdmin && (
        <Button size="sm" variant="secondary" className="h-9 rounded-full" asChild>
          <Link href="/admin/problems/new">
            <Plus className="size-4" /> Create Problem
          </Link>
        </Button>
      )}

      {total !== undefined && (
        <span className="ml-auto text-sm text-muted-foreground">{total} problems</span>
      )}
    </div>
  );
}
