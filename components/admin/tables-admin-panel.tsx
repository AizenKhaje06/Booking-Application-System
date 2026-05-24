"use client";

import { TableStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { updateTableStatus } from "@/actions/admin/branches";
import { DataTablePagination } from "@/components/admin/data-table-pagination";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import { usePaginatedFilter } from "@/components/admin/use-paginated-filter";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface AdminTableRow {
  id: string;
  tableNumber: string;
  capacity: number;
  floor: number;
  status: TableStatus;
  branch: { name: string; slug: string };
  _count: { reservations: number };
}

const STATUS_OPTIONS = Object.values(TableStatus).map((s) => ({
  value: s,
  label: s.charAt(0) + s.slice(1).toLowerCase(),
}));

const STATUS_VARIANT: Record<TableStatus, "success" | "warning" | "destructive" | "muted"> = {
  AVAILABLE: "success",
  OCCUPIED: "warning",
  RESERVED: "muted",
  MAINTENANCE: "destructive",
};

export function TablesAdminPanel({ tables }: { tables: AdminTableRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    search,
    setSearch,
    filter,
    setFilter,
    page,
    setPage,
    paginated,
    filteredCount,
    totalPages,
    pageSize,
  } = usePaginatedFilter(tables, {
    filterKey: "status",
    getSearchText: (t) => `${t.tableNumber} ${t.branch.name} Floor ${t.floor}`,
  });

  function handleStatusChange(tableId: string, status: TableStatus) {
    startTransition(async () => {
      const result = await updateTableStatus({ tableId, status });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Table updated");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search table or branch..."
        filterValue={filter}
        filterOptions={STATUS_OPTIONS}
        onFilterChange={setFilter}
      />
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Table</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Floor</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[140px]">Update</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground h-24 text-center">
                  No tables found
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.tableNumber}</TableCell>
                  <TableCell>{t.branch.name}</TableCell>
                  <TableCell>{t.floor}</TableCell>
                  <TableCell>{t.capacity}</TableCell>
                  <TableCell>{t._count.reservations}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[t.status]}>{t.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={t.status}
                      onValueChange={(v) => handleStatusChange(t.id, v as TableStatus)}
                      disabled={isPending}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination
        page={page}
        totalPages={totalPages}
        totalItems={filteredCount}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </div>
  );
}
