import Link from "next/link";
import { notFound } from "next/navigation";

import { getAdminBranchDetail } from "@/actions/admin/branches";
import { AdminHeader } from "@/components/admin/layout/admin-header";
import { ReservationStatusBadge } from "@/components/reservations/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/booking/display";
import { getAdminScope } from "@/lib/admin/scope";
import { getCurrentUser } from "@/lib/session";

export const metadata = { title: "Branch detail" };

export default async function AdminBranchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const scope = await getAdminScope();
  const result = await getAdminBranchDetail(id);

  if (!result.success) {
    notFound();
  }

  const { branch, recentReservations, tableStats } = result.data;

  return (
    <>
      <AdminHeader
        title={branch.name}
        description={branch.address}
        userName={user?.name ?? "Admin"}
      />
      <div className="flex-1 space-y-6 p-4 lg:p-6">
        <div className="flex flex-wrap gap-2">
          {scope.isSuperAdmin && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/branches">← All branches</Link>
            </Button>
          )}
          <Button size="sm" asChild>
            <Link href="/admin/tables">Manage tables</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/reservations">Reservations</Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm">Tables</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">{branch.tables.length}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm">Reservations</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">{branch._count.reservations}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm">Staff</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">{branch._count.staff}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm">Event venues</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">{branch.eventVenues.length}</CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Table status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {tableStats.map((s) => (
              <Badge key={s.status} variant="outline">
                {s.status}: {s._count.id}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent reservations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentReservations.length === 0 ? (
              <p className="text-muted-foreground text-sm">No reservations</p>
            ) : (
              recentReservations.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                >
                  <span>
                    {r.customer.name} · {formatDate(r.reservationDate, "MMM d")}
                  </span>
                  <ReservationStatusBadge status={r.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
