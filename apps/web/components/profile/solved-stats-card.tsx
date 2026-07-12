"use client";

import { Card, CardContent } from "~/components/ui/card";
import type { ProfileDetail } from "./types";

const RING_RADIUS = 46;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const SEGMENTS = [
  { key: "easy", label: "Easy", text: "text-teal-400", bar: "bg-teal-400", stroke: "stroke-teal-400" },
  { key: "medium", label: "Medium", text: "text-yellow-400", bar: "bg-yellow-400", stroke: "stroke-yellow-400" },
  { key: "hard", label: "Hard", text: "text-red-400", bar: "bg-red-400", stroke: "stroke-red-400" },
] as const;

export function SolvedStatsCard({ stats }: { stats: ProfileDetail["stats"] }) {
  const { solved, totals } = stats;
  const denominator = Math.max(1, totals.total);

  // Each difficulty gets an arc proportional to its solved share of all problems.
  let offset = 0;
  const arcs = SEGMENTS.map((segment) => {
    const fraction = solved[segment.key] / denominator;
    const arc = {
      ...segment,
      dash: fraction * RING_CIRCUMFERENCE,
      offset,
    };
    offset += fraction * RING_CIRCUMFERENCE;
    return arc;
  });

  return (
    <Card className="py-4">
      <CardContent className="flex flex-wrap items-center gap-6 px-5">
        <div className="relative size-32 shrink-0">
          <svg viewBox="0 0 110 110" className="size-full -rotate-90">
            <circle
              cx="55"
              cy="55"
              r={RING_RADIUS}
              fill="none"
              strokeWidth="7"
              className="stroke-muted"
            />
            {arcs.map((arc) =>
              arc.dash > 0 ? (
                <circle
                  key={arc.key}
                  cx="55"
                  cy="55"
                  r={RING_RADIUS}
                  fill="none"
                  strokeWidth="7"
                  strokeLinecap="round"
                  className={arc.stroke}
                  strokeDasharray={`${arc.dash} ${RING_CIRCUMFERENCE - arc.dash}`}
                  strokeDashoffset={-arc.offset}
                />
              ) : null,
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold">{solved.total}</span>
            <span className="text-xs text-muted-foreground">/ {totals.total}</span>
            <span className="text-[0.65rem] text-muted-foreground">Solved</span>
          </div>
        </div>

        <div className="min-w-44 flex-1 space-y-3">
          {SEGMENTS.map((segment) => {
            const done = solved[segment.key];
            const total = totals[segment.key];
            const pct = total > 0 ? (done / total) * 100 : 0;
            return (
              <div key={segment.key} className="space-y-1">
                <div className="flex items-baseline justify-between text-xs">
                  <span className={segment.text}>{segment.label}</span>
                  <span className="text-muted-foreground">
                    <span className="font-medium text-foreground">{done}</span>/{total}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${segment.bar}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
