import { UserRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export type AdminScope = {
  userId: string;
  role: UserRole;
  branchId: string | null;
  isSuperAdmin: boolean;
};

export async function getAdminScope(): Promise<AdminScope> {
  const user = await requireAdmin();

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true, branchId: true },
  });

  if (!dbUser) {
    throw new Error("User not found");
  }

  const isSuperAdmin = dbUser.role === UserRole.SUPER_ADMIN;

  return {
    userId: user.id,
    role: dbUser.role,
    branchId: isSuperAdmin ? null : dbUser.branchId,
    isSuperAdmin,
  };
}

export function reservationBranchFilter(scope: AdminScope) {
  if (scope.branchId) return { branchId: scope.branchId };
  return {};
}

export function venueBranchFilter(scope: AdminScope) {
  if (scope.branchId) return { venue: { branchId: scope.branchId } };
  return {};
}

export function tableBranchFilter(scope: AdminScope) {
  if (scope.branchId) return { branchId: scope.branchId };
  return {};
}

export function userBranchFilter(scope: AdminScope) {
  if (scope.branchId) return { branchId: scope.branchId };
  return {};
}
