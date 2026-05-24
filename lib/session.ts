import { UserRole } from "@prisma/client";

import { auth } from "@/lib/auth";
import { hasRole, isAdminRole, isStaffRole } from "@/lib/auth/roles";

export async function getSession() {
  return auth();
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function requireRole(allowed: UserRole[]) {
  const user = await requireAuth();
  if (!hasRole(user.role, allowed)) {
    throw new Error("Forbidden");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (!isAdminRole(user.role)) {
    throw new Error("Forbidden");
  }
  return user;
}

export async function requireStaff() {
  const user = await requireAuth();
  if (!isStaffRole(user.role)) {
    throw new Error("Forbidden");
  }
  return user;
}
