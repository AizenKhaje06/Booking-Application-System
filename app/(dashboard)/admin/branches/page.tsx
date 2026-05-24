import Link from "next/link";
import { redirect } from "next/navigation";

import { getAdminBranches } from "@/actions/admin/branches";
import { AdminHeader } from "@/components/admin/layout/admin-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminScope } from "@/lib/admin/scope";
import { getCurrentUser } from "@/lib/session";

export const metadata = { title: "Branches" };

export default async function AdminBranchesPage() {
  const scope = await getAdminScope();
  if (!scope.isSuperAdmin) {
    redirect(scope.branchId ? `/admin/branches/${scope.branchId}` : "/admin");
  }

  const user = await getCurrentUser();
  const result = await getAdminBranches();
  const branches = result.success ? result.data : [];

  return (
    <>
      <AdminHeader
        title="Branch management"
        description="View and manage all restaurant locations"
        userName={user?.name ?? "Admin"}
      />
      <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 lg:p-6">
        {branches.map((branch) => (
          <Link key={branch.id} href={`/admin/branches/${branch.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{branch.name}</CardTitle>
                  {branch.isMainBranch && <Badge>Main</Badge>}
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-1 text-sm">
                <p>{branch.address}</p>
                <p>{branch.phone}</p>
                <div className="text-foreground mt-3 flex flex-wrap gap-3 text-xs font-medium">
                  <span>{branch._count.tables} tables</span>
                  <span>{branch._count.reservations} reservations</span>
                  <span>{branch._count.staff} staff</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
