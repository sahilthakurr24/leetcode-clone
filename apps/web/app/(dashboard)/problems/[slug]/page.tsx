"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";

import { CodeEditor, codeStorageKey } from "~/components/workspace/code-editor";
import { ConsolePanel, type ConsoleOutcome } from "~/components/workspace/console-panel";
import { ProblemDescription } from "~/components/workspace/problem-description";
import { SubmissionsTab } from "~/components/workspace/submissions-tab";
import { getSampleTestCases } from "~/components/workspace/types";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "~/components/ui/empty";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useProblemBySlug } from "~/hooks/api/problem";
import { useRunSamples, useSubmit } from "~/hooks/api/submission";

function isUnauthorized(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    (error as { data?: { code?: string } }).data?.code === "UNAUTHORIZED"
  );
}

function judgeErrorToast(error: unknown, action: string) {
  if (isUnauthorized(error)) {
    toast("Sign in to " + action, {
      description: "You need an account to run code against the judge.",
      action: { label: "Sign in", onClick: () => (window.location.href = "/signin") },
    });
    return;
  }
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message: unknown }).message)
      : "Something went wrong.";
  toast.error(message);
}

export default function ProblemWorkspacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: detail, isLoading, isError } = useProblemBySlug(slug);

  const [languageSlug, setLanguageSlug] = useState<string>();
  const [code, setCode] = useState("");
  const [outcome, setOutcome] = useState<ConsoleOutcome>(null);
  const [resultVersion, setResultVersion] = useState(0);

  const runSamples = useRunSamples();
  const submit = useSubmit();
  const isJudging = runSamples.isPending || submit.isPending;

  const languages = detail?.languages ?? [];
  const activeLanguageSlug = languageSlug ?? languages[0]?.language.slug;

  // Load saved code (or starter) whenever the problem/language pair changes.
  useEffect(() => {
    if (!detail || !activeLanguageSlug) return;
    const starter =
      detail.languages.find((l) => l.language.slug === activeLanguageSlug)
        ?.starterCode ?? "";
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(codeStorageKey(slug, activeLanguageSlug));
    } catch {
      // storage unavailable
    }
    // An empty saved buffer must never shadow the starter template.
    setCode(saved && saved.trim() !== "" ? saved : starter);
  }, [detail, activeLanguageSlug, slug]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] gap-4">
        <Skeleton className="h-full flex-1" />
        <Skeleton className="h-full flex-1" />
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <Empty className="h-[60vh] border border-dashed">
        <EmptyHeader>
          <EmptyTitle>Problem not found</EmptyTitle>
          <EmptyDescription>
            This problem doesn&apos;t exist or isn&apos;t published.{" "}
            <Link href="/problemset" className="text-blue-400 hover:underline">
              Back to problems
            </Link>
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const samples = getSampleTestCases(detail);

  async function handleRun() {
    if (!activeLanguageSlug || !detail) return;
    try {
      const { results } = await runSamples.mutateAsync({
        problemId: detail.problem.id,
        languageSlug: activeLanguageSlug,
        sourceCode: code,
      });
      setOutcome({ kind: "run", results });
      setResultVersion((v) => v + 1);
    } catch (error) {
      judgeErrorToast(error, "run code");
    }
  }

  async function handleSubmit() {
    if (!activeLanguageSlug || !detail) return;
    try {
      const { submission } = await submit.mutateAsync({
        problemId: detail.problem.id,
        languageSlug: activeLanguageSlug,
        sourceCode: code,
      });
      setOutcome({ kind: "submit", submission });
      setResultVersion((v) => v + 1);
    } catch (error) {
      judgeErrorToast(error, "submit");
    }
  }

  return (
    <div className="h-[calc(100vh-6.5rem)] min-h-96">
      <ResizablePanelGroup orientation="horizontal" className="rounded-lg border border-border">
        <ResizablePanel defaultSize="45%" minSize="24%">
          <Tabs defaultValue="description" className="h-full gap-0">
            <TabsList className="h-9 w-full justify-start rounded-none border-b border-border bg-transparent p-0 px-2">
              <TabsTrigger value="description" className="h-7 rounded-md px-3 text-xs">
                Description
              </TabsTrigger>
              <TabsTrigger value="submissions" className="h-7 rounded-md px-3 text-xs">
                Submissions
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="min-h-0 flex-1">
              <ProblemDescription detail={detail} />
            </TabsContent>
            <TabsContent value="submissions" className="min-h-0 flex-1">
              <SubmissionsTab problemId={detail.problem.id} />
            </TabsContent>
          </Tabs>
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize="55%" minSize="30%">
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel defaultSize="65%" minSize="20%">
              <CodeEditor
                problemSlug={slug}
                languages={languages}
                activeLanguageSlug={activeLanguageSlug ?? ""}
                onLanguageChange={setLanguageSlug}
                code={code}
                onCodeChange={setCode}
                onRun={handleRun}
                onSubmit={handleSubmit}
                isJudging={isJudging}
              />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize="35%" minSize="15%">
              <ConsolePanel
                samples={samples}
                params={detail.params}
                outcome={outcome}
                isJudging={isJudging}
                resultVersion={resultVersion}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
