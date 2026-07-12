import { Code2 } from "lucide-react";

import { cn } from "~/lib/utils";

/**
 * LeetClone wordmark: the yellow brand icon next to the "LeetClone" text,
 * matching the navbar/footer branding. Used on the (always-light) auth pages.
 */
export function LeetCloneLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 select-none", className)}>
      <Code2 className="h-8 w-8 text-yellow-500" aria-label="LeetClone" />
      <span className="text-2xl font-medium tracking-tight text-neutral-800">
        LeetClone
      </span>
    </div>
  );
}
