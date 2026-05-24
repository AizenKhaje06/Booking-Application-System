import { getReservationStatusBreakdown, getRevenueChartData } from "@/actions/admin/dashboard";
import { RevenueChart } from "@/components/admin/dashboard/revenue-chart";
import { StatusPieChart } from "@/components/admin/dashboard/status-pie-chart";
import { AdminHeader } from "@/components/admin/layout/admin-header";
import { getCurrentUser } from "@/lib/session";

export const metadata = { title: "Analytics" };

export default async function AdminAnalyticsPage() {
  const user = await getCurrentUser();

  const [revenueResult, statusResult] = await Promise.all([
    getRevenueChartData(),
    getReservationStatusBreakdown(),
  ]);

  const revenue = revenueResult.success ? revenueResult.data : [];
  const statusData = statusResult.success ? statusResult.data : [];

  return (
    <>
      <AdminHeader
        title="Revenue analytics"
        description="Charts and breakdowns for business performance"
        userName={user?.name ?? "Admin"}
      />
      <div className="grid gap-6 p-4 lg:p-6">
        <RevenueChart data={revenue} />
        <div className="grid gap-6 md:grid-cols-2">
          <StatusPieChart data={statusData} title="Reservations by status" />
          <StatusPieChart
            data={revenue.map((r) => ({
              name: r.month,
              value: r.reservations + r.events,
            }))}
            title="Bookings per month"
          />
        </div>
      </div>
    </>
  );
}
