"use client";

import { cloneElement, useEffect, useMemo, useRef, useState } from "react";
import { ActivityCalendar, type Activity } from "react-activity-calendar";
import { useTheme } from "next-themes";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { ActivityData } from "./types";

const WEEK_COLUMNS = 53;
const BLOCK_MARGIN = 3;

/** Local YYYY-MM-DD, matching the date strings the API returns. */
function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Submission count → 0–4 intensity bucket. */
function levelFor(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

const THEME = {
  light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
  dark: ["rgba(255,255,255,0.08)", "#0e4429", "#087f47", "#10b981", "#34d353"],
};

export function ActivityHeatmap({ data }: { data: ActivityData | undefined }) {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [blockSize, setBlockSize] = useState(11);

  // The library renders a fixed-width SVG (weeks × blockSize), so size the
  // blocks from the measured container width to fill the card at any panel
  // size — deterministic, unlike CSS-scaling the SVG.
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const compute = (width: number) => {
      const size = Math.floor(
        (width - (WEEK_COLUMNS - 1) * BLOCK_MARGIN) / WEEK_COLUMNS,
      );
      setBlockSize(Math.min(24, Math.max(8, size)));
    };

    compute(element.clientWidth);
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) compute(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // The calendar needs an entry for every day in its range, so fill the past
  // 12 months from the sparse per-day counts the API returns.
  const calendarData = useMemo<Activity[]>(() => {
    const counts = new Map<string, number>();
    for (const row of data?.activity ?? []) counts.set(row.date, row.count);

    const today = new Date();
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const cursor = new Date(end);
    cursor.setDate(cursor.getDate() - 364);

    const days: Activity[] = [];
    while (cursor <= end) {
      const key = localDateKey(cursor);
      const count = counts.get(key) ?? 0;
      days.push({ date: key, count, level: levelFor(count) });
      cursor.setDate(cursor.getDate() + 1);
    }
    return days;
  }, [data]);

  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-sm font-normal">
          <span className="font-semibold">{data?.totalPastYear ?? 0}</span>{" "}
          <span className="text-muted-foreground">submissions in the past one year</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <div ref={containerRef}>
          <ActivityCalendar
          data={calendarData}
          theme={THEME}
          colorScheme={resolvedTheme === "light" ? "light" : "dark"}
          blockSize={blockSize}
          blockMargin={BLOCK_MARGIN}
          fontSize={12}
          maxLevel={4}
          showTotalCount={false}
          renderBlock={(block, activity) =>
            cloneElement(
              block,
              {},
              <title>{`${activity.count} submission${activity.count === 1 ? "" : "s"} on ${activity.date}`}</title>,
            )
          }
          />
        </div>
      </CardContent>
    </Card>
  );
}
