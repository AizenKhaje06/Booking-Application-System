"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type SortDirection = "asc" | "desc";

export interface ColumnDef<T> {
  id: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
  hideOnMobile?: boolean;
}

interface InteractiveDataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  getRowKey: (row: T) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  isLoading?: boolean;
  mobileCard?: (row: T) => React.ReactNode;
}

export function InteractiveDataTable<T>({
  data,
  columns,
  getRowKey,
  emptyTitle = "No results",
  emptyDescription = "Try adjusting your search or filters.",
  isLoading,
  mobileCard,
}: InteractiveDataTableProps<T>) {
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  const sorted = useMemo(() => {
    if (!sortCol) return data;
    const col = columns.find((c) => c.id === sortCol);
    if (!col?.sortValue) return data;
    return [...data].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, columns, sortCol, sortDir]);

  function toggleSort(colId: string) {
    const col = columns.find((c) => c.id === colId);
    if (!col?.sortValue) return;
    if (sortCol === colId) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(colId);
      setSortDir("asc");
    }
  }

  if (isLoading) {
    return (
      <div className="bg-card space-y-2 rounded-lg border p-4">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (sorted.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <>
      {mobileCard && (
        <div className="space-y-3 md:hidden">
          {sorted.map((row) => (
            <div key={getRowKey(row)} className="luxury-card p-4">
              {mobileCard(row)}
            </div>
          ))}
        </div>
      )}

      <div
        className={cn("bg-card overflow-hidden rounded-lg border", mobileCard && "hidden md:block")}
      >
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((col) => (
                <TableHead
                  key={col.id}
                  className={cn(col.className, col.hideOnMobile && "hidden lg:table-cell")}
                >
                  {col.sortValue ? (
                    <button
                      type="button"
                      className="hover:text-foreground flex items-center gap-1 font-medium transition-colors"
                      onClick={() => toggleSort(col.id)}
                    >
                      {col.header}
                      {sortCol === col.id ? (
                        sortDir === "asc" ? (
                          <ArrowUp className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((row) => (
              <TableRow key={getRowKey(row)} className="hover:bg-muted/50 transition-colors">
                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    className={cn(col.className, col.hideOnMobile && "hidden lg:table-cell")}
                  >
                    {col.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
