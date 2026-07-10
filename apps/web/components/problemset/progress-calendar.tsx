"use client";

import { useMemo } from "react";
import { Flame } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useMyProgress } from "~/hooks/api/progress";
import { cn } from "~/lib/utils";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

/**
 * Small month-grid widget for the sidebar. Days on which the user solved a
 * problem get a highlight; today gets a ring.
 */
export function ProgressCalendar() {
  const { data } = useMyProgress();

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const solvedDays = useMemo(() => {
    const days = new Set<number>();
    for (const entry of data?.progress ?? []) {
      if (!entry.solvedAt) continue;
      const solved = new Date(entry.solvedAt);
      if (solved.getFullYear() === year && solved.getMonth() === month) {
        days.add(solved.getDate());
      }
    }
    return days;
  }, [data, year, month]);

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthLabel = today.toLocaleString("en-US", { month: "long", year: "numeric" });

  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle className="flex items-center justify-between text-sm">
          <span>{monthLabel}</span>
          <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
            <Flame className="size-3.5 text-orange-400" />
            {solvedDays.size} active {solvedDays.size === 1 ? "day" : "days"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {WEEKDAY_LABELS.map((label, i) => (
            <span key={`${label}-${i}`} className="text-muted-foreground">
              {label}
            </span>
          ))}
          {cells.map((day, i) =>
            day === null ? (
              <span key={`pad-${i}`} />
            ) : (
              <span
                key={day}
                className={cn(
                  "flex size-7 items-center justify-center rounded-md",
                  solvedDays.has(day) && "bg-emerald-500/20 font-medium text-emerald-400",
                  day === today.getDate() && "ring-1 ring-primary",
                )}
              >
                {day}
              </span>
            ),
          )}
        </div>
      </CardContent>
    </Card>
  );
}
