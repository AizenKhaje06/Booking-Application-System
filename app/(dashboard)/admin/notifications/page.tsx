import { getAdminNotifications } from "@/actions/admin/notifications";
import { AdminHeader } from "@/components/admin/layout/admin-header";
import { NotificationsPanel } from "@/components/admin/notifications-panel";
import { getCurrentUser } from "@/lib/session";

export const metadata = { title: "Notifications" };

export default async function AdminNotificationsPage() {
  const user = await getCurrentUser();
  const result = await getAdminNotifications();
  const notifications = result.success ? result.data : [];

  return (
    <>
      <AdminHeader
        title="Notifications"
        description="System alerts and booking updates"
        userName={user?.name ?? "Admin"}
      />
      <div className="flex-1 p-4 lg:p-6">
        <NotificationsPanel notifications={notifications} />
      </div>
    </>
  );
}
