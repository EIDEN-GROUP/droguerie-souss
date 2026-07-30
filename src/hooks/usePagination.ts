import { useEffect, useMemo, useState } from "react";

/**
 * Client side pagination over an already filtered list.
 * Resets to page 1 whenever the list shrinks below the current page.
 */
export function usePagination<T>(items: T[], initialPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    if (page > pageCount) setPage(1);
  }, [page, pageCount]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const changePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  return { page, setPage, pageSize, changePageSize, pageCount, total, pageItems, from, to };
}
