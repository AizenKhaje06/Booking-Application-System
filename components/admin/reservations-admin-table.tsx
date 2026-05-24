"use client";

import { ReservationStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { updateReservationStatus } from "@/actions/admin/reservations";
import { DataTablePagination } from "@/components/admin/data-table-pagination";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import { type ColumnDef, InteractiveDataTable } from "@/components/admin/interactive-data-table";
import { usePaginatedFilter } from "@/components/admin/use-paginated-filter";
import { StatusConfirmDialog } from "@/components/shared/status-confirm-dialog";
import { ReservationStatusBadge } from "@/components/reservations/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate, formatTimeDisplay } from "@/lib/booking/display";

export interface AdminReservationRow {
  id: string;
  guestCount: number;
  reservationDate: Date;
  reservationTime: string;
  status: ReservationStatus;
  branch: { name: string; slug: string };
  customer: { name: string; email: string; phone: string | null };
  table: { tableNumber: string } | null;
}

const STATUS_OPTIONS = Object.values(ReservationStatus).map((s) => ({
  value: s,
  label: s.replace("_", " "),
}));

const DESTRUCTIVE_STATUSES: ReservationStatus[] = [
  ReservationStatus.CANCELLED,
  ReservationStatus.NO_SHOW,
];

export function ReservationsAdminTable({ reservations }: { reservations: AdminReservationRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingStatus, setPendingStatus] = useState<{
    id: string;
    status: ReservationStatus;
  } | null>(null);

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
  } = usePaginatedFilter(reservations, {
    filterKey: "status",
    getSearchText: (r) =>
      `${r.customer.name} ${r.customer.email} ${r.branch.name} ${r.table?.tableNumber ?? ""}`,
  });

  const applyStatusChange = useCallback(
    (id: string, status: ReservationStatus) => {
      startTransition(async () => {
        const result = await updateReservationStatus({ reservationId: id, status });
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success("Reservation updated");
        setPendingStatus(null);
        router.refresh();
      });
    },
    [router],
  );

  const handleStatusChange = useCallback(
    (id: string, status: ReservationStatus) => {
      if (DESTRUCTIVE_STATUSES.includes(status)) {
        setPendingStatus({ id, status });
        return;
      }
      applyStatusChange(id, status);
    },
    [applyStatusChange],
  );

  const columns: ColumnDef<AdminReservationRow>[] = useMemo(
    () => [
      {
        id: "guest",
        header: "Guest",
        sortValue: (r) => r.customer.name,
        cell: (r) => (
          <>
            <p className="font-medium">{r.customer.name}</p>
            <p className="text-muted-foreground text-xs">{r.customer.email}</p>
          </>
        ),
      },
      {
        id: "branch",
        header: "Branch",
        sortValue: (r) => r.branch.name,
        cell: (r) => r.branch.name,
        hideOnMobile: true,
      },
      {
        id: "datetime",
        header: "Date & time",
        sortValue: (r) => r.reservationDate.getTime(),
        cell: (r) => (
          <>
            {formatDate(r.reservationDate, "MMM d, yyyy")}
            <br />
            <span className="text-muted-foreground text-xs">
              {formatTimeDisplay(r.reservationTime)}
            </span>
          </>
        ),
      },
      {
        id: "guests",
        header: "Guests",
        sortValue: (r) => r.guestCount,
        cell: (r) => r.guestCount,
        hideOnMobile: true,
      },
      {
        id: "table",
        header: "Table",
        sortValue: (r) => r.table?.tableNumber ?? "",
        cell: (r) => r.table?.tableNumber ?? "—",
        hideOnMobile: true,
      },
      {
        id: "status",
        header: "Status",
        sortValue: (r) => r.status,
        cell: (r) => <ReservationStatusBadge status={r.status} />,
      },
      {
        id: "action",
        header: "Action",
        cell: (r) => (
          <Select
            value={r.status}
            onValueChange={(v) => handleStatusChange(r.id, v as ReservationStatus)}
            disabled={isPending}
          >
            <SelectTrigger className="h-9 min-w-[120px]">
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
        ),
      },
    ],
    [isPending, handleStatusChange],
  );

  return (
    <div className="space-y-4">
      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search guest, email, branch..."
        filterValue={filter}
        filterOptions={STATUS_OPTIONS}
        onFilterChange={setFilter}
      />

      <InteractiveDataTable
        data={paginated}
        columns={columns}
        getRowKey={(r) => r.id}
        emptyTitle="No reservations found"
        emptyDescription="Try adjusting your search or status filter."
        mobileCard={(r) => (
          <div className="space-y-2 text-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{r.customer.name}</p>
                <p className="text-muted-foreground text-xs">{r.customer.email}</p>
              </div>
              <ReservationStatusBadge status={r.status} />
            </div>
            <p>
              {r.branch.name} · {formatDate(r.reservationDate, "MMM d")} ·{" "}
              {formatTimeDisplay(r.reservationTime)}
            </p>
            <p className="text-muted-foreground">
              {r.guestCount} guests · Table {r.table?.tableNumber ?? "—"}
            </p>
          </div>
        )}
      />

      <DataTablePagination
        page={page}
        totalPages={totalPages}
        totalItems={filteredCount}
        pageSize={pageSize}
        onPageChange={setPage}
      />

      {pendingStatus && (
        <StatusConfirmDialog
          open={!!pendingStatus}
          onOpenChange={(open) => !open && setPendingStatus(null)}
          title={`Mark as ${pendingStatus.status.replace("_", " ").toLowerCase()}?`}
          description="This will update the reservation status and may notify the guest. Please confirm this change."
          confirmLabel="Update status"
          loading={isPending}
          onConfirm={() => applyStatusChange(pendingStatus.id, pendingStatus.status)}
        />
      )}
    </div>
  );
}
