"use client";

import { useMemo, useState } from "react";

const PAGE_SIZE = 10;

export function usePaginatedFilter<T>(
  items: T[],
  options: {
    searchKeys?: (keyof T)[];
    getSearchText?: (item: T) => string;
    filterKey?: keyof T;
    pageSize?: number;
  },
) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = options.pageSize ?? PAGE_SIZE;

  const filtered = useMemo(() => {
    let result = items;

    if (filter !== "all" && options.filterKey) {
      result = result.filter((item) => String(item[options.filterKey!]) === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((item) => {
        if (options.getSearchText) {
          return options.getSearchText(item).toLowerCase().includes(q);
        }
        return (options.searchKeys ?? []).some((key) => {
          const val = item[key];
          return val != null && String(val).toLowerCase().includes(q);
        });
      });
    }

    return result;
  }, [items, search, filter, options.searchKeys, options.filterKey, options.getSearchText]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  function setSearchValue(value: string) {
    setSearch(value);
    setPage(1);
  }

  function setFilterValue(value: string) {
    setFilter(value);
    setPage(1);
  }

  return {
    search,
    setSearch: setSearchValue,
    filter,
    setFilter: setFilterValue,
    page: currentPage,
    setPage,
    paginated,
    filteredCount: filtered.length,
    totalPages,
    pageSize,
  };
}
