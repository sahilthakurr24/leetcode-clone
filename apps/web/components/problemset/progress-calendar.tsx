"use client";

import { useMemo } from "react";
import { Flame, Lock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useMyAttendance } from "~/hooks/api/attendance";
import { cn } from "~/lib/utils";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

/** Local YYYY-MM-DD for a given day of the current month (matches DB date strings). */
function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Month-grid attendance widget backed by the `attendance` table. Future days are
 * locked; past days (and today) are green when a problem was solved that day and
 * red otherwise. Neutral for signed-out users (no attendance to show).
 */
export function ProgressCalendar() {
  const { data, isError } = useMyAttendance();
  const showActivity = !!data && !isError;

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayDate = today.getDate();

  const solvedDays = useMemo(() => {
    const days = new Set<string>();
    for (const row of data?.attendance ?? []) {
      if (row.solved) days.add(row.attendanceDate);
    }
    return days;
  }, [data]);

  const monthPrefix = dateKey(year, month, 1).slice(0, 7); // "YYYY-MM"
  const activeCount = useMemo(
    () => [...solvedDays].filter((d) => d.startsWith(monthPrefix)).length,
    [solvedDays, monthPrefix],
  );

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
            {activeCount} active {activeCount === 1 ? "day" : "days"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4">
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {WEEKDAY_LABELS.map((label, i) => (
            <span key={`${label}-${i}`} className="text-muted-foreground">
              {label}
            </span>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <span key={`pad-${i}`} />;

            const isFuture = day > todayDate;
            const isToday = day === todayDate;
            const solved = solvedDays.has(dateKey(year, month, day));

            return (
              <span
                key={day}
                title={isFuture ? "Locked" : undefined}
                className={cn(
                  "flex size-7 items-center justify-center rounded-md",
                  isFuture && "cursor-not-allowed text-muted-foreground/40",
                  !isFuture &&
                    showActivity &&
                    solved &&
                    "bg-emerald-500/25 font-medium text-emerald-300",
                  !isFuture && showActivity && !solved && "bg-red-500/15 text-red-400",
                  !isFuture && !showActivity && "text-foreground",
                  isToday && "ring-1 ring-primary",
                )}
              >
                {isFuture ? <Lock className="size-3 opacity-50" /> : day}
              </span>
            );
          })}
        </div>

        {showActivity && (
          <div className="flex items-center gap-3 text-[0.7rem] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="size-2.5 rounded-sm bg-emerald-500/60" /> Solved
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2.5 rounded-sm bg-red-500/50" /> Missed
            </span>
            <span className="flex items-center gap-1">
              <Lock className="size-2.5" /> Locked
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
