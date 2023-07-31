import { useState } from "react";

/**
 * A hook for implementing index-based pagination. Mathematically expressed: [0, maxPage).
 * @param initialPage Initial page index number.
 * @param maxPage Collection length.
 * @param allowOverflow If true, then the last index is equal to collection's length.
 */
export function usePagination(
  initialPage: number,
  maxPage: number,
  allowOverflow?: boolean
) {
  const [page, setPage] = useState(initialPage);

  function next() {
    const nextPage = page + 1;

    if (allowOverflow ? nextPage <= maxPage : nextPage < maxPage) {
      setPage(nextPage);
    }
  }

  function previous() {
    const previousPage = page - 1;

    if (previousPage >= 0) {
      setPage(previousPage);
    }
  }

  const isFirstPage = 0 === page;
  const isLastPage = page === maxPage - 1;
  const isOverflow = page === maxPage;

  return {
    page,
    isFirstPage,
    isLastPage,
    isOverflow,
    next,
    previous,
  };
}
