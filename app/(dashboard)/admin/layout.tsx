import { redirect } from "next/navigation";

import { AdminSidebar } from "@/components/admin/layout/admin-sidebar";
import { getAdminNav } from "@/lib/admin/navigation";
import { getAdminScope } from "@/lib/admin/scope";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { isAdminRole } from "@/lib/auth/roles";
import { getCurrentUser } from "@/lib/session";

export const metadata = {
  title: { default: "Admin", template: "%s · Admin · RestaurantHub" },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || !isAdminRole(user.role)) {
    redirect("/auth/unauthorized");
  }

  const scope = await getAdminScope();
  const navItems = getAdminNav(scope);
  const roleLabel = user.role ? ROLE_LABELS[user.role] : "Admin";

  return (
    <div className="bg-muted/30 flex min-h-screen">
      <AdminSidebar navItems={navItems} roleLabel={roleLabel} />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
