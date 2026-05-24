import { UserRole } from "@prisma/client";

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  BRANCH_ADMIN: "Branch Admin",
  STAFF: "Staff",
  CUSTOMER: "Customer",
};

export const ADMIN_ROLES: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN];

export const STAFF_ROLES: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.BRANCH_ADMIN,
  UserRole.STAFF,
];

export function isAdminRole(role?: UserRole | null): boolean {
  return role != null && ADMIN_ROLES.includes(role);
}

export function isStaffRole(role?: UserRole | null): boolean {
  return role != null && STAFF_ROLES.includes(role);
}

export function hasRole(role: UserRole | null | undefined, allowed: UserRole[]): boolean {
  return role != null && allowed.includes(role);
}
