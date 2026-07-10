"use client";

import { useState } from "react";

import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Spinner } from "~/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";
import {
  formatInput,
  type ProblemParam,
  type RunResults,
  type SampleTestCase,
  type SubmitResult,
} from "./types";

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

/** Console output: either a sample run or a full submission. */
export type ConsoleOutcome =
  | { kind: "run"; results: RunResults["results"] }
  | { kind: "submit"; submission: SubmitResult["submission"] }
  | null;

interface ConsolePanelProps {
  samples: SampleTestCase[];
  params: ProblemParam[];
  outcome: ConsoleOutcome;
  isJudging: boolean;
  /** Bumped each time a run finishes so the panel flips to the Result tab. */
  resultVersion: number;
}

function MonoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <pre className="overflow-x-auto rounded-md bg-muted px-3 py-2 font-mono text-xs">
        {value}
      </pre>
    </div>
  );
}

export function ConsolePanel({
  samples,
  params,
  outcome,
  isJudging,
  resultVersion,
}: ConsolePanelProps) {
  // Keyed remount on resultVersion switches to the Result tab after each run
  // without fighting the user's manual tab choice in between.
  return (
    <Tabs
      key={resultVersion}
      defaultValue={resultVersion > 0 ? "result" : "testcase"}
      className="h-full gap-0"
    >
      <TabsList className="h-9 w-full justify-start rounded-none border-b border-border bg-transparent p-0 px-2">
        <TabsTrigger value="testcase" className="h-7 rounded-md px-3 text-xs">
          Testcase
        </TabsTrigger>
        <TabsTrigger value="result" className="h-7 rounded-md px-3 text-xs">
          {isJudging && <Spinner className="size-3" />} Test Result
        </TabsTrigger>
      </TabsList>

      <TabsContent value="testcase" className="min-h-0 flex-1">
        <ScrollArea className="h-full">
          <CaseTabs samples={samples} params={params} />
        </ScrollArea>
      </TabsContent>

      <TabsContent value="result" className="min-h-0 flex-1">
        <ScrollArea className="h-full">
          {isJudging ? (
            <div className="flex h-32 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Spinner className="size-4" /> Judging…
            </div>
          ) : outcome === null ? (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              Run your code to see results here.
            </div>
          ) : outcome.kind === "run" ? (
            <RunResultView results={outcome.results} samples={samples} params={params} />
          ) : (
            <SubmitResultView submission={outcome.submission} />
          )}
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}

function CaseTabs({
  samples,
  params,
  statuses,
}: {
  samples: SampleTestCase[];
  params: ProblemParam[];
  statuses?: (string | undefined)[];
}) {
  const [active, setActive] = useState(0);
  const sample = samples[active];

  return (
    <div className="space-y-3 p-3">
      <div className="flex flex-wrap gap-2">
        {samples.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActive(i)}
            className={cn(
              "rounded-md px-3 py-1 text-xs transition-colors",
              i === active ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50",
            )}
          >
            {statuses?.[i] && (
              <span className={cn("mr-1.5 inline-block size-1.5 rounded-full align-middle",
                statuses[i] === "accepted" ? "bg-emerald-400" : "bg-red-400")}
              />
            )}
            Case {i + 1}
          </button>
        ))}
      </div>
      {sample && (
        <div className="space-y-3">
          {formatInput(params, sample.input).map((line, i) => {
            const [name, ...rest] = line.split(" = ");
            return <MonoBlock key={i} label={`${name} =`} value={rest.join(" = ")} />;
          })}
        </div>
      )}
    </div>
  );
}

function RunResultView({
  results,
  samples,
  params,
}: {
  results: RunResults["results"];
  samples: SampleTestCase[];
  params: ProblemParam[];
}) {
  const [active, setActive] = useState(0);
  const result = results[active];
  const sample = samples[active];
  const allAccepted = results.every((r) => r.status === "accepted");
  const overall = allAccepted ? "accepted" : (results.find((r) => r.status !== "accepted")?.status ?? "accepted");

  return (
    <div className="space-y-3 p-3">
      <p className={cn("text-base font-semibold", statusColor(overall))}>
        {STATUS_LABELS[overall] ?? overall}
      </p>

      <div className="flex flex-wrap gap-2">
        {results.map((r, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
              "rounded-md px-3 py-1 text-xs transition-colors",
              i === active ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50",
            )}
          >
            <span
              className={cn(
                "mr-1.5 inline-block size-1.5 rounded-full align-middle",
                r.status === "accepted" ? "bg-emerald-400" : "bg-red-400",
              )}
            />
            Case {i + 1}
          </button>
        ))}
      </div>

      {result && (
        <div className="space-y-3">
          {sample && (
            <div className="space-y-3">
              {formatInput(params, sample.input).map((line, i) => {
                const [name, ...rest] = line.split(" = ");
                return <MonoBlock key={i} label={`${name} =`} value={rest.join(" = ")} />;
              })}
            </div>
          )}
          <MonoBlock label="Output" value={result.stdout?.trim() || "(empty)"} />
          <MonoBlock label="Expected" value={JSON.stringify(result.expectedOutput)} />
          {result.stderr && <MonoBlock label="Stderr" value={result.stderr} />}
          <div className="flex gap-2 text-xs text-muted-foreground">
            {result.timeMs != null && <Badge variant="secondary">{result.timeMs} ms</Badge>}
            {result.memoryKb != null && (
              <Badge variant="secondary">{(result.memoryKb / 1024).toFixed(1)} MB</Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SubmitResultView({ submission }: { submission: SubmitResult["submission"] }) {
  if (!submission) {
    return (
      <div className="p-3 text-sm text-muted-foreground">Submission failed to record.</div>
    );
  }

  return (
    <div className="space-y-3 p-3">
      <div className="flex items-baseline gap-3">
        <p className={cn("text-base font-semibold", statusColor(submission.status))}>
          {STATUS_LABELS[submission.status] ?? submission.status}
        </p>
        <p className="text-xs text-muted-foreground">
          {submission.passedTestCases}/{submission.totalTestCases ?? "?"} testcases passed
        </p>
      </div>

      {submission.status === "accepted" && (
        <div className="flex gap-2">
          <Badge variant="secondary">Runtime: {submission.runtimeMs ?? "—"} ms</Badge>
          <Badge variant="secondary">
            Memory: {submission.memoryKb != null ? `${(submission.memoryKb / 1024).toFixed(1)} MB` : "—"}
          </Badge>
        </div>
      )}

      {submission.status !== "accepted" && submission.errorMessage && (
        <MonoBlock label="Error" value={submission.errorMessage} />
      )}
    </div>
  );
}
