"use client";

import Link from "next/link";
import { CircleCheckBig, CircleDot } from "lucide-react";

import type { RouterOutputs } from "@repo/trpc/client";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "~/components/ui/empty";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { cn } from "~/lib/utils";

type ProblemRow = RouterOutputs["problem"]["listProblems"]["problems"][number];

const DIFFICULTY_STYLES = {
  easy: "text-teal-400",
  medium: "text-yellow-400",
  hard: "text-red-400",
} as const;

const DIFFICULTY_LABELS = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
} as const;

function acceptanceRate(problem: ProblemRow): string {
  if (problem.totalSubmissions === 0) return "—";
  return `${((problem.totalAccepted / problem.totalSubmissions) * 100).toFixed(1)}%`;
}

function StatusIcon({ status }: { status: ProblemRow["status"] }) {
  if (status === "solved") {
    return <CircleCheckBig className="size-4 text-emerald-400" aria-label="Solved" />;
  }
  if (status === "attempted") {
    return <CircleDot className="size-4 text-yellow-400" aria-label="Attempted" />;
  }
  return null;
}

interface ProblemsTableProps {
  problems: ProblemRow[] | undefined;
  isLoading: boolean;
  pageSize: number;
}

export function ProblemsTable({ problems, isLoading, pageSize }: ProblemsTableProps) {
  if (!isLoading && problems?.length === 0) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyTitle>No problems found</EmptyTitle>
          <EmptyDescription>
            Try clearing the search or switching filters.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-none text-xs text-muted-foreground hover:bg-transparent">
          <TableHead className="w-12">Status</TableHead>
          <TableHead>Title</TableHead>
          <TableHead className="w-28 text-right">Acceptance</TableHead>
          <TableHead className="w-24 text-right">Difficulty</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading && !problems
          ? Array.from({ length: Math.min(pageSize, 10) }).map((_, i) => (
              <TableRow key={i} className="border-none odd:bg-muted/50">
                <TableCell><Skeleton className="size-4 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-56" /></TableCell>
                <TableCell><Skeleton className="ml-auto h-4 w-12" /></TableCell>
                <TableCell><Skeleton className="ml-auto h-4 w-14" /></TableCell>
              </TableRow>
            ))
          : problems?.map((problem) => (
              <TableRow
                key={problem.id}
                className="border-none odd:bg-muted/50 hover:bg-muted"
              >
                <TableCell>
                  <StatusIcon status={problem.status} />
                </TableCell>
                <TableCell className="max-w-0 truncate font-medium">
                  <Link
                    href={`/problems/${problem.slug}`}
                    className="hover:text-blue-400"
                  >
                    {problem.displayId}. {problem.title}
                  </Link>
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {acceptanceRate(problem)}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right text-sm",
                    DIFFICULTY_STYLES[problem.difficulty],
                  )}
                >
                  {DIFFICULTY_LABELS[problem.difficulty]}
                </TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  );
}
