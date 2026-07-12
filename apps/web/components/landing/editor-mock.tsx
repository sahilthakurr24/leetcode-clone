import { CheckCircle2 } from "lucide-react";

/**
 * Decorative mock of the code workspace: a fake editor window showing a
 * solved Two Sum in Python with an "Accepted" verdict. Pure markup — no
 * Monaco, no interactivity.
 */
export function EditorMock() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <span className="size-3 rounded-full bg-red-400/80" />
        <span className="size-3 rounded-full bg-yellow-400/80" />
        <span className="size-3 rounded-full bg-green-400/80" />
        <span className="ml-3 rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
          two-sum.py
        </span>
      </div>

      <pre className="overflow-x-auto px-4 py-4 font-mono text-[13px] leading-6">
        <code>
          <Line n={1}>
            <span className="text-purple-600 dark:text-purple-400">class</span>{" "}
            <span className="text-amber-600 dark:text-yellow-300">Solution</span>:
          </Line>
          <Line n={2}>
            {"    "}
            <span className="text-purple-600 dark:text-purple-400">def</span>{" "}
            <span className="text-sky-600 dark:text-sky-400">twoSum</span>(
            <span className="text-orange-600 dark:text-orange-300">self</span>, nums, target):
          </Line>
          <Line n={3}>
            {"        "}seen = {"{}"}
          </Line>
          <Line n={4}>
            {"        "}
            <span className="text-purple-600 dark:text-purple-400">for</span> i, n{" "}
            <span className="text-purple-600 dark:text-purple-400">in</span>{" "}
            <span className="text-sky-600 dark:text-sky-400">enumerate</span>(nums):
          </Line>
          <Line n={5}>
            {"            "}
            <span className="text-purple-600 dark:text-purple-400">if</span> target - n{" "}
            <span className="text-purple-600 dark:text-purple-400">in</span> seen:
          </Line>
          <Line n={6}>
            {"                "}
            <span className="text-purple-600 dark:text-purple-400">return</span> [seen[target - n], i]
          </Line>
          <Line n={7}>{"            "}seen[n] = i</Line>
        </code>
      </pre>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border bg-muted/50 px-4 py-3 text-sm">
        <span className="flex items-center gap-1.5 font-medium text-green-600 dark:text-green-400">
          <CheckCircle2 className="size-4" /> Accepted
        </span>
        <span className="text-muted-foreground">3 / 3 test cases passed</span>
        <span className="ml-auto font-mono text-xs text-muted-foreground">
          Runtime: 38 ms
        </span>
      </div>
    </div>
  );
}

function Line({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex">
      <span className="w-7 shrink-0 select-none text-right text-muted-foreground/50">
        {n}
      </span>
      <span className="pl-4 whitespace-pre">{children}</span>
    </div>
  );
}
