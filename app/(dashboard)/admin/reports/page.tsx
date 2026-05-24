import { getAdminReportSummary } from "@/actions/admin/users";
import { AdminHeader } from "@/components/admin/layout/admin-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/session";

export const metadata = { title: "Reports" };

export default async function AdminReportsPage() {
  const user = await getCurrentUser();
  const result = await getAdminReportSummary();
  const data = result.success
    ? result.data
    : { reservationsByStatus: [], eventsByStatus: [], branches: [], topBranches: [] };

  return (
    <>
      <AdminHeader
        title="Reports"
        description="Operational summaries and branch performance"
        userName={user?.name ?? "Admin"}
      />
      <div className="grid gap-6 p-4 lg:grid-cols-2 lg:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reservations by status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.reservationsByStatus.length === 0 ? (
              <p className="text-muted-foreground text-sm">No data</p>
            ) : (
              data.reservationsByStatus.map((row) => (
                <div key={row.status} className="flex justify-between text-sm">
                  <span className="capitalize">{row.status.toLowerCase().replace("_", " ")}</span>
                  <span className="font-semibold">{row._count.id}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Events by status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.eventsByStatus.length === 0 ? (
              <p className="text-muted-foreground text-sm">No data</p>
            ) : (
              data.eventsByStatus.map((row) => (
                <div key={row.status} className="flex justify-between text-sm">
                  <span className="capitalize">{row.status.toLowerCase()}</span>
                  <span className="font-semibold">{row._count.id}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Branch summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b text-left">
                    <th className="pr-4 pb-2">Branch</th>
                    <th className="pr-4 pb-2">Reservations</th>
                    <th className="pb-2">Tables</th>
                  </tr>
                </thead>
                <tbody>
                  {data.branches.map((b) => (
                    <tr key={b.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium">{b.name}</td>
                      <td className="py-2 pr-4">{b._count.reservations}</td>
                      <td className="py-2">{b._count.tables}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {data.topBranches.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Top branches by reservations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.topBranches.map((b, i) => (
                <div key={b.branchId} className="flex justify-between text-sm">
                  <span>
                    #{i + 1} {b.name}
                  </span>
                  <span className="font-semibold">{b.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
