import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZES = [10, 25, 50, 100];

interface TablePaginationProps {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  from: number;
  to: number;
  label: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

/** Builds a compact page list like [1, "...", 4, 5, 6, "...", 12]. */
function pageRange(page: number, pageCount: number): (number | "gap")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const pages: (number | "gap")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);
  if (start > 2) pages.push("gap");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < pageCount - 1) pages.push("gap");
  pages.push(pageCount);
  return pages;
}

export function TablePagination({
  page,
  pageCount,
  pageSize,
  total,
  from,
  to,
  label,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) {
  if (total === 0) return null;

  return (
    <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
          {from}–{to} sur {total} {label}
        </p>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          aria-label="Lignes par page"
          className="rounded-full border border-border bg-paper px-3 py-1.5 text-xs outline-none focus:border-brand"
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            aria-label="Page précédente"
            className="grid h-8 w-8 place-items-center rounded-full border border-border text-ink-soft transition hover:border-brand hover:text-brand disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {pageRange(page, pageCount).map((p, i) =>
            p === "gap" ? (
              <span key={`gap-${i}`} className="px-1 text-xs text-ink-soft">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                aria-current={p === page ? "page" : undefined}
                className={`h-8 min-w-8 rounded-full px-2.5 text-xs font-bold transition ${
                  p === page
                    ? "bg-ink text-paper"
                    : "border border-border text-ink hover:border-brand hover:text-brand"
                }`}
              >
                {p}
              </button>
            ),
          )}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === pageCount}
            aria-label="Page suivante"
            className="grid h-8 w-8 place-items-center rounded-full border border-border text-ink-soft transition hover:border-brand hover:text-brand disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
