import { getAdminReservations } from "@/actions/admin/reservations";
import { AdminHeader } from "@/components/admin/layout/admin-header";
import { ReservationsAdminTable } from "@/components/admin/reservations-admin-table";
import { getCurrentUser } from "@/lib/session";

export const metadata = { title: "Reservations" };

export default async function AdminReservationsPage() {
  const user = await getCurrentUser();
  const result = await getAdminReservations();
  const reservations = result.success ? result.data : [];

  return (
    <>
      <AdminHeader
        title="Reservations"
        description="Search, filter, and approve or update reservation status"
        userName={user?.name ?? "Admin"}
      />
      <div className="flex-1 p-4 lg:p-6">
        <ReservationsAdminTable reservations={reservations} />
      </div>
    </>
  );
}
