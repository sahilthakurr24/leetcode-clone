"use client";

import { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { CloudUpload, Play, RotateCcw } from "lucide-react";
import { useTheme } from "next-themes";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Spinner } from "~/components/ui/spinner";
import type { ProblemLanguage } from "./types";

export function codeStorageKey(problemSlug: string, languageSlug: string): string {
  return `leetclone:code:${problemSlug}:${languageSlug}`;
}

/** Short display names for the switcher; falls back to the DB name. */
const LANGUAGE_LABELS: Record<string, string> = {
  cpp: "C++",
  java: "Java",
  python3: "Python3",
  javascript: "JavaScript",
  typescript: "TypeScript",
  csharp: "C#",
  c: "C",
  go: "Go",
  kotlin: "Kotlin",
  swift: "Swift",
  rust: "Rust",
  ruby: "Ruby",
  php: "PHP",
};

export function languageLabel(slug: string, fallback: string): string {
  return LANGUAGE_LABELS[slug] ?? fallback;
}

interface CodeEditorProps {
  problemSlug: string;
  languages: ProblemLanguage[];
  activeLanguageSlug: string;
  onLanguageChange: (slug: string) => void;
  code: string;
  onCodeChange: (code: string) => void;
  onRun: () => void;
  onSubmit: () => void;
  isJudging: boolean;
}

export function CodeEditor({
  problemSlug,
  languages,
  activeLanguageSlug,
  onLanguageChange,
  code,
  onCodeChange,
  onRun,
  onSubmit,
  isJudging,
}: CodeEditorProps) {
  const { resolvedTheme } = useTheme();
  const active = languages.find((l) => l.language.slug === activeLanguageSlug);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persist on user edits only (Monaco's onChange doesn't fire for programmatic
  // value swaps), debounced. Saving from an effect on `code` was racy: the
  // initial ""/previous-language buffer could get written under the new key.
  function handleEditorChange(value: string) {
    onCodeChange(value);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (value.trim() === "") return;
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(codeStorageKey(problemSlug, activeLanguageSlug), value);
      } catch {
        // Storage full/unavailable — persistence is best-effort.
      }
    }, 500);
  }

  // Cancel any pending save when the key changes or on unmount.
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [problemSlug, activeLanguageSlug]);

  function handleReset() {
    try {
      localStorage.removeItem(codeStorageKey(problemSlug, activeLanguageSlug));
    } catch {
      // ignore
    }
    onCodeChange(active?.starterCode ?? "");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-2 py-1.5">
        <Select value={activeLanguageSlug} onValueChange={onLanguageChange}>
          <SelectTrigger size="sm" className="h-7 w-32 border-0 bg-transparent text-xs">
            <SelectValue />
          </SelectTrigger>
          {/* max-h-none: show every language in one flat list, no inner scroll */}
          <SelectContent className="max-h-none">
            {languages.map((entry) => (
              <SelectItem key={entry.language.slug} value={entry.language.slug}>
                {languageLabel(entry.language.slug, entry.language.name)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label="Reset to starter code"
            >
              <RotateCcw className="size-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset code?</AlertDialogTitle>
              <AlertDialogDescription>
                Your current code for this language will be replaced with the
                default starter code.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="ml-auto flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="h-7 text-xs"
            onClick={onRun}
            disabled={isJudging}
          >
            {isJudging ? <Spinner className="size-3.5" /> : <Play className="size-3.5" />}
            Run
          </Button>
          <Button
            size="sm"
            className="h-7 bg-emerald-600 text-xs text-white hover:bg-emerald-500"
            onClick={onSubmit}
            disabled={isJudging}
          >
            <CloudUpload className="size-3.5" /> Submit
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <Editor
          language={active?.language.monacoLanguage ?? "plaintext"}
          value={code}
          onChange={(value) => handleEditorChange(value ?? "")}
          theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            padding: { top: 8 },
          }}
        />
      </div>
    </div>
  );
}
