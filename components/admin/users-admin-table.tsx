"use client";

import { UserRole } from "@prisma/client";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { updateAdminUser } from "@/actions/admin/users";
import { DataTablePagination } from "@/components/admin/data-table-pagination";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import { type ColumnDef, InteractiveDataTable } from "@/components/admin/interactive-data-table";
import { usePaginatedFilter } from "@/components/admin/use-paginated-filter";
import { StatusConfirmDialog } from "@/components/shared/status-confirm-dialog";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  branch: { name: string } | null;
  createdAt: Date;
}

interface UsersAdminTableProps {
  users: AdminUserRow[];
  isSuperAdmin: boolean;
  allowedRoles: UserRole[];
}

export function UsersAdminTable({ users, isSuperAdmin, allowedRoles }: UsersAdminTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingRoleChange, setPendingRoleChange] = useState<{
    userId: string;
    role: UserRole;
    userName: string;
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
  } = usePaginatedFilter(users, {
    filterKey: "role",
    getSearchText: (u) => `${u.name} ${u.email} ${u.branch?.name ?? ""}`,
  });

  const roleOptions = allowedRoles.map((r) => ({
    value: r,
    label: ROLE_LABELS[r],
  }));

  function applyRoleChange(userId: string, role: UserRole) {
    startTransition(async () => {
      const result = await updateAdminUser({ userId, role });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("User updated");
      setPendingRoleChange(null);
      router.refresh();
    });
  }

  function handleRoleChange(userId: string, role: UserRole, userName: string) {
    setPendingRoleChange({ userId, role, userName });
  }

  const columns: ColumnDef<AdminUserRow>[] = useMemo(() => {
    const cols: ColumnDef<AdminUserRow>[] = [
      {
        id: "name",
        header: "Name",
        sortValue: (u) => u.name,
        cell: (u) => <span className="font-medium">{u.name}</span>,
      },
      {
        id: "email",
        header: "Email",
        sortValue: (u) => u.email,
        cell: (u) => u.email,
        hideOnMobile: true,
      },
      {
        id: "role",
        header: "Role",
        sortValue: (u) => u.role,
        cell: (u) => <Badge variant="outline">{ROLE_LABELS[u.role]}</Badge>,
      },
      {
        id: "branch",
        header: "Branch",
        sortValue: (u) => u.branch?.name ?? "",
        cell: (u) => u.branch?.name ?? "—",
        hideOnMobile: true,
      },
      {
        id: "joined",
        header: "Joined",
        sortValue: (u) => u.createdAt.getTime(),
        cell: (u) => (
          <span className="text-muted-foreground">{format(u.createdAt, "MMM d, yyyy")}</span>
        ),
        hideOnMobile: true,
      },
    ];

    if (isSuperAdmin) {
      cols.push({
        id: "change",
        header: "Change role",
        cell: (u) =>
          u.role === UserRole.SUPER_ADMIN ? (
            <span className="text-muted-foreground text-xs">Protected</span>
          ) : (
            <Select
              value={u.role}
              onValueChange={(v) => handleRoleChange(u.id, v as UserRole, u.name)}
              disabled={isPending}
            >
              <SelectTrigger className="h-9 min-w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allowedRoles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ),
      });
    }

    return cols;
  }, [isSuperAdmin, allowedRoles, isPending]);

  return (
    <div className="space-y-4">
      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search name or email..."
        filterValue={filter}
        filterOptions={roleOptions}
        onFilterChange={setFilter}
      />

      <InteractiveDataTable
        data={paginated}
        columns={columns}
        getRowKey={(u) => u.id}
        emptyTitle="No users found"
        emptyDescription="Try adjusting your search or role filter."
        mobileCard={(u) => (
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-medium">{u.name}</p>
              <Badge variant="outline">{ROLE_LABELS[u.role]}</Badge>
            </div>
            <p className="text-muted-foreground">{u.email}</p>
            <p className="text-muted-foreground text-xs">
              {u.branch?.name ?? "No branch"} · {format(u.createdAt, "MMM d, yyyy")}
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

      {pendingRoleChange && (
        <StatusConfirmDialog
          open={!!pendingRoleChange}
          onOpenChange={(open) => !open && setPendingRoleChange(null)}
          title={`Change role for ${pendingRoleChange.userName}?`}
          description={`This will update their role to ${ROLE_LABELS[pendingRoleChange.role]}. They may gain or lose access to admin features.`}
          confirmLabel="Update role"
          variant="default"
          loading={isPending}
          onConfirm={() => applyRoleChange(pendingRoleChange.userId, pendingRoleChange.role)}
        />
      )}
    </div>
  );
}
