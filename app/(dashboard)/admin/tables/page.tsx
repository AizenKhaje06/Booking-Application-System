import { getAdminTables } from "@/actions/admin/branches";
import { AdminHeader } from "@/components/admin/layout/admin-header";
import { TablesAdminPanel } from "@/components/admin/tables-admin-panel";
import { getCurrentUser } from "@/lib/session";

export const metadata = { title: "Tables" };

export default async function AdminTablesPage() {
  const user = await getCurrentUser();
  const result = await getAdminTables();
  const tables = result.success ? result.data : [];

  return (
    <>
      <AdminHeader
        title="Table management"
        description="Update table availability and status by branch"
        userName={user?.name ?? "Admin"}
      />
      <div className="flex-1 p-4 lg:p-6">
        <TablesAdminPanel tables={tables} />
      </div>
    </>
  );
}
