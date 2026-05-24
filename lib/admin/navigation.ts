import {
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  FileText,
  LayoutDashboard,
  PartyPopper,
  Table2,
  Users,
  UserCog,
} from "lucide-react";

import type { AdminScope } from "@/lib/admin/scope";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

const BASE_NAV: AdminNavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/reservations", label: "Reservations", icon: CalendarDays },
  { href: "/admin/events", label: "Event bookings", icon: PartyPopper },
  { href: "/admin/tables", label: "Tables", icon: Table2 },
  { href: "/admin/staff", label: "Staff", icon: UserCog },
  { href: "/admin/reports", label: "Reports", icon: FileText },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
];

const SUPER_ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin/branches", label: "Branches", icon: Building2 },
  { href: "/admin/users", label: "User management", icon: Users },
];

export function getAdminNav(scope: AdminScope): AdminNavItem[] {
  const items: AdminNavItem[] = [...BASE_NAV];

  if (!scope.isSuperAdmin && scope.branchId) {
    items.splice(1, 0, {
      href: `/admin/branches/${scope.branchId}`,
      label: "My branch",
      icon: Building2,
    });
  }

  if (scope.isSuperAdmin) {
    items.splice(3, 0, ...SUPER_ADMIN_NAV);
  }

  return items;
}
