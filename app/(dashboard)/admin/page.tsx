import Link from "next/link";

import {
  getActivityLog,
  getCalendarBookings,
  getDashboardOverview,
  getRecentReservations,
  getReservationStatusBreakdown,
  getRevenueChartData,
} from "@/actions/admin/dashboard";
import { ActivityLog } from "@/components/admin/dashboard/activity-log";
import { CalendarDashboard } from "@/components/admin/dashboard/calendar-dashboard";
import { RevenueChart } from "@/components/admin/dashboard/revenue-chart";
import { StatsCards } from "@/components/admin/dashboard/stats-cards";
import { StatusPieChart } from "@/components/admin/dashboard/status-pie-chart";
import { AdminHeader } from "@/components/admin/layout/admin-header";
import { ReservationStatusBadge } from "@/components/reservations/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminScope } from "@/lib/admin/scope";
import { formatDate, formatTimeDisplay } from "@/lib/booking/display";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  const scope = await getAdminScope();
  const now = new Date();

  const [
    overviewResult,
    revenueResult,
    statusResult,
    activityResult,
    calendarResult,
    recentResult,
    unreadCount,
  ] = await Promise.all([
    getDashboardOverview(),
    getRevenueChartData(),
    getReservationStatusBreakdown(),
    getActivityLog(12),
    getCalendarBookings(now.getFullYear(), now.getMonth() + 1),
    getRecentReservations(6),
    prisma.notification.count({
      where: { userId: user!.id, isRead: false },
    }),
  ]);

  const stats = overviewResult.success
    ? overviewResult.data
    : {
        totalReservations: 0,
        pendingReservations: 0,
        todayReservations: 0,
        totalEventBookings: 0,
        pendingEvents: 0,
        totalBranches: 0,
        totalUsers: 0,
        staffCount: 0,
        totalRevenue: 0,
        monthRevenue: 0,
      };

  const revenue = revenueResult.success ? revenueResult.data : [];
  const statusData = statusResult.success ? statusResult.data : [];
  const activity = activityResult.success ? activityResult.data : [];
  const calendar = calendarResult.success ? calendarResult.data : { reservations: [], events: [] };
  const recent = recentResult.success ? recentResult.data : [];

  return (
    <>
      <AdminHeader
        title="Dashboard overview"
        description={
          scope.isSuperAdmin
            ? "Network-wide analytics and operations"
            : "Your branch performance at a glance"
        }
        userName={user?.name ?? "Admin"}
        unreadNotifications={unreadCount}
      />
      <div className="flex-1 space-y-6 p-4 lg:p-6">
        <StatsCards stats={stats} isSuperAdmin={scope.isSuperAdmin} />

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <RevenueChart data={revenue} />
          </div>
          <StatusPieChart data={statusData} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <CalendarDashboard reservations={calendar.reservations} events={calendar.events} />
          <ActivityLog items={activity} />
        </div>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Recent reservations</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/reservations">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-muted-foreground text-sm">No reservations yet</p>
            ) : (
              <div className="space-y-3">
                {recent.map((r) => (
                  <div
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium">{r.customer.name}</p>
                      <p className="text-muted-foreground">
                        {r.branch.name} · {formatDate(r.reservationDate, "MMM d")} ·{" "}
                        {formatTimeDisplay(r.reservationTime)}
                      </p>
                    </div>
                    <ReservationStatusBadge status={r.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
