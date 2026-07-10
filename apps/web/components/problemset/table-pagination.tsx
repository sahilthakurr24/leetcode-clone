"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface TablePaginationProps {
  total: number;
  limit: number;
  offset: number;
  onOffsetChange: (offset: number) => void;
  onLimitChange: (limit: number) => void;
}

/** Page numbers to render: first, last, and a window around the current page. */
function pageWindow(current: number, pageCount: number): (number | "gap")[] {
  const pages = new Set<number>([1, pageCount, current - 1, current, current + 1]);
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= pageCount)
    .sort((a, b) => a - b);

  const result: (number | "gap")[] = [];
  let previous = 0;
  for (const page of sorted) {
    if (page - previous > 1) result.push("gap");
    result.push(page);
    previous = page;
  }
  return result;
}

export function TablePagination({
  total,
  limit,
  offset,
  onOffsetChange,
  onLimitChange,
}: TablePaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / limit));
  const current = Math.floor(offset / limit) + 1;

  return (
    <div className="flex items-center justify-between gap-2">
      <Pagination className="mx-0 w-auto justify-start">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              aria-disabled={current <= 1}
              className={current <= 1 ? "pointer-events-none opacity-50" : ""}
              onClick={(e) => {
                e.preventDefault();
                onOffsetChange(Math.max(0, offset - limit));
              }}
            />
          </PaginationItem>
          {pageWindow(current, pageCount).map((page, i) =>
            page === "gap" ? (
              <PaginationItem key={`gap-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  isActive={page === current}
                  onClick={(e) => {
                    e.preventDefault();
                    onOffsetChange((page - 1) * limit);
                  }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ),
          )}
          <PaginationItem>
            <PaginationNext
              href="#"
              aria-disabled={current >= pageCount}
              className={current >= pageCount ? "pointer-events-none opacity-50" : ""}
              onClick={(e) => {
                e.preventDefault();
                if (current < pageCount) onOffsetChange(offset + limit);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <Select value={String(limit)} onValueChange={(v) => onLimitChange(Number(v))}>
        <SelectTrigger className="h-8 w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {[20, 50, 100].map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size} / page
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
