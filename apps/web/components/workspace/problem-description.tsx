"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CircleCheckBig, CircleDot, Lightbulb } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useProblemStatus } from "~/hooks/api/progress";
import { cn } from "~/lib/utils";
import { formatInput, getSampleTestCases, type ProblemDetail } from "./types";

const DIFFICULTY_STYLES = {
  easy: "bg-teal-500/15 text-teal-400",
  medium: "bg-yellow-500/15 text-yellow-400",
  hard: "bg-red-500/15 text-red-400",
} as const;

const DIFFICULTY_LABELS = { easy: "Easy", medium: "Medium", hard: "Hard" } as const;

/** Shared markdown renderer styled for the dark workspace theme. */
function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: (props) => <p className="mb-3 leading-relaxed" {...props} />,
        code: (props) => (
          <code
            className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]"
            {...props}
          />
        ),
        pre: (props) => (
          <pre className="mb-3 overflow-x-auto rounded-md bg-muted p-3" {...props} />
        ),
        ul: (props) => <ul className="mb-3 list-disc space-y-1 pl-5" {...props} />,
        ol: (props) => <ol className="mb-3 list-decimal space-y-1 pl-5" {...props} />,
        strong: (props) => <strong className="font-semibold" {...props} />,
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

export function ProblemDescription({ detail }: { detail: ProblemDetail }) {
  const { problem, params, hints } = detail;
  const samples = getSampleTestCases(detail);
  const { data: statusData } = useProblemStatus(problem.id);
  const status = statusData?.status?.status;

  return (
    <ScrollArea className="h-full">
      <div className="space-y-5 p-4 text-sm">
        <div className="space-y-2">
          <h1 className="text-lg font-semibold">
            {problem.displayId}. {problem.title}
          </h1>
          <div className="flex items-center gap-2">
            <Badge
              className={cn(
                "rounded-full border-0",
                DIFFICULTY_STYLES[problem.difficulty],
              )}
            >
              {DIFFICULTY_LABELS[problem.difficulty]}
            </Badge>
            {status === "solved" && (
              <Badge className="rounded-full border-0 bg-emerald-500/15 text-emerald-400">
                <CircleCheckBig className="size-3" /> Solved
              </Badge>
            )}
            {status === "attempted" && (
              <Badge className="rounded-full border-0 bg-yellow-500/15 text-yellow-400">
                <CircleDot className="size-3" /> Attempted
              </Badge>
            )}
          </div>
        </div>

        <div>
          <Markdown>{problem.description}</Markdown>
        </div>

        {samples.map((sample, index) => (
          <div key={sample.id} className="space-y-2">
            <p className="font-semibold">Example {index + 1}:</p>
            <div className="space-y-1 rounded-md border-l-2 border-muted-foreground/30 bg-muted/40 p-3 font-mono text-xs">
              <p>
                <span className="font-semibold text-muted-foreground">Input: </span>
                {formatInput(params, sample.input).join(", ")}
              </p>
              <p>
                <span className="font-semibold text-muted-foreground">Output: </span>
                {JSON.stringify(sample.expectedOutput)}
              </p>
              {sample.explanation && (
                <p className="font-sans">
                  <span className="font-semibold text-muted-foreground">
                    Explanation:{" "}
                  </span>
                  {sample.explanation}
                </p>
              )}
            </div>
          </div>
        ))}

        {problem.constraints && (
          <div className="space-y-2">
            <p className="font-semibold">Constraints:</p>
            <Markdown>{problem.constraints}</Markdown>
          </div>
        )}

        {hints.length > 0 && (
          <Accordion type="multiple" className="w-full">
            {hints.map((hint, index) => (
              <AccordionItem key={hint.id} value={hint.id}>
                <AccordionTrigger className="text-sm">
                  <span className="flex items-center gap-2">
                    <Lightbulb className="size-4 text-yellow-400" /> Hint {index + 1}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {hint.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </ScrollArea>
  );
}
