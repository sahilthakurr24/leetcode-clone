"use client";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "~/components/ui/empty";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useMySubmissions } from "~/hooks/api/submission";
import { cn } from "~/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  accepted: "Accepted",
  wrong_answer: "Wrong Answer",
  time_limit_exceeded: "Time Limit Exceeded",
  memory_limit_exceeded: "Memory Limit Exceeded",
  output_limit_exceeded: "Output Limit Exceeded",
  runtime_error: "Runtime Error",
  compilation_error: "Compilation Error",
  internal_error: "Internal Error",
  judging: "Judging",
  pending: "Pending",
};

function statusColor(status: string): string {
  if (status === "accepted") return "text-emerald-400";
  if (status === "judging" || status === "pending") return "text-yellow-400";
  return "text-red-400";
}

export function SubmissionsTab({ problemId }: { problemId: string }) {
  const { data, isLoading, isError } = useMySubmissions({ problemId });
  const submissions = data?.submissions ?? [];

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    );
  }

  if (isError || submissions.length === 0) {
    return (
      <Empty className="h-full border-0">
        <EmptyHeader>
          <EmptyTitle>No submissions yet</EmptyTitle>
          <EmptyDescription>
            {isError
              ? "Sign in to see your submission history for this problem."
              : "Your submissions for this problem will show up here."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ScrollArea className="h-full">
      <Table>
        <TableHeader>
          <TableRow className="text-xs text-muted-foreground hover:bg-transparent">
            <TableHead>Status</TableHead>
            <TableHead>Language</TableHead>
            <TableHead className="text-right">Runtime</TableHead>
            <TableHead className="text-right">Memory</TableHead>
            <TableHead className="text-right">Passed</TableHead>
            <TableHead className="text-right">When</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission) => (
            <TableRow key={submission.id} className="text-xs">
              <TableCell
                className={cn("font-medium", statusColor(submission.status))}
              >
                {STATUS_LABELS[submission.status] ?? submission.status}
              </TableCell>
              <TableCell>{submission.language}</TableCell>
              <TableCell className="text-right">
                {submission.runtimeMs != null ? `${submission.runtimeMs} ms` : "—"}
              </TableCell>
              <TableCell className="text-right">
                {submission.memoryKb != null
                  ? `${(submission.memoryKb / 1024).toFixed(1)} MB`
                  : "—"}
              </TableCell>
              <TableCell className="text-right">
                {submission.passedTestCases}/{submission.totalTestCases ?? "?"}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {new Date(submission.createdAt).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
