import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";

import { getAdminUsers } from "@/actions/admin/users";
import { AdminHeader } from "@/components/admin/layout/admin-header";
import { UsersAdminTable } from "@/components/admin/users-admin-table";
import { getAdminScope } from "@/lib/admin/scope";
import { getCurrentUser } from "@/lib/session";

export const metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const scope = await getAdminScope();
  if (!scope.isSuperAdmin) {
    redirect("/admin/staff");
  }

  const user = await getCurrentUser();
  const result = await getAdminUsers();
  const users = result.success ? result.data : [];

  const allowedRoles = [
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.STAFF,
    UserRole.CUSTOMER,
  ];

  return (
    <>
      <AdminHeader
        title="User management"
        description="Manage roles and access across the platform"
        userName={user?.name ?? "Admin"}
      />
      <div className="flex-1 p-4 lg:p-6">
        <UsersAdminTable users={users} isSuperAdmin allowedRoles={allowedRoles} />
      </div>
    </>
  );
}
