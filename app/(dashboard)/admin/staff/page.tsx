import { UserRole } from "@prisma/client";

import { getAdminUsers } from "@/actions/admin/users";
import { AdminHeader } from "@/components/admin/layout/admin-header";
import { UsersAdminTable } from "@/components/admin/users-admin-table";
import { getAdminScope } from "@/lib/admin/scope";
import { getCurrentUser } from "@/lib/session";

export const metadata = { title: "Staff" };

export default async function AdminStaffPage() {
  const scope = await getAdminScope();
  const user = await getCurrentUser();
  const result = await getAdminUsers();
  const users = result.success ? result.data : [];

  const allowedRoles = scope.isSuperAdmin
    ? [UserRole.BRANCH_ADMIN, UserRole.STAFF]
    : [UserRole.STAFF];

  return (
    <>
      <AdminHeader
        title="Staff management"
        description="View and manage team members at your branch"
        userName={user?.name ?? "Admin"}
      />
      <div className="flex-1 p-4 lg:p-6">
        <UsersAdminTable
          users={users}
          isSuperAdmin={scope.isSuperAdmin}
          allowedRoles={allowedRoles}
        />
      </div>
    </>
  );
}
