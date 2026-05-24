"use server";

import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAdminScope, userBranchFilter } from "@/lib/admin/scope";
import { prisma } from "@/lib/prisma";
import { toActionError } from "@/utils/errors";

const updateUserSchema = z.object({
  userId: z.string().min(1),
  role: z.nativeEnum(UserRole).optional(),
  branchId: z.string().nullable().optional(),
});

export async function getAdminUsers() {
  try {
    const scope = await getAdminScope();

    if (scope.isSuperAdmin) {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          branchId: true,
          createdAt: true,
          branch: { select: { name: true } },
          _count: { select: { reservations: true, eventBookings: true } },
        },
      });
      return { success: true as const, data: users };
    }

    const users = await prisma.user.findMany({
      where: {
        ...userBranchFilter(scope),
        role: { in: [UserRole.STAFF, UserRole.BRANCH_ADMIN] },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        branchId: true,
        createdAt: true,
        branch: { select: { name: true } },
      },
    });

    return { success: true as const, data: users };
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateAdminUser(data: unknown) {
  try {
    const scope = await getAdminScope();

    const parsed = updateUserSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false as const, error: parsed.error.issues[0]?.message };
    }

    const { userId, role, branchId } = parsed.data;

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) {
      return { success: false as const, error: "User not found" };
    }

    if (!scope.isSuperAdmin) {
      if (target.branchId !== scope.branchId) {
        return { success: false as const, error: "Forbidden" };
      }
      const branchAllowed: UserRole[] = [UserRole.STAFF, UserRole.BRANCH_ADMIN];
      if (role && !branchAllowed.includes(role)) {
        return { success: false as const, error: "Cannot assign this role" };
      }
    }

    if (target.role === UserRole.SUPER_ADMIN && !scope.isSuperAdmin) {
      return { success: false as const, error: "Forbidden" };
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(role !== undefined ? { role } : {}),
        ...(branchId !== undefined ? { branchId } : {}),
      },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin/staff");

    return { success: true as const, data: updated };
  } catch (error) {
    return toActionError(error);
  }
}

export async function getAdminReportSummary() {
  try {
    const scope = await getAdminScope();
    const branchWhere = scope.branchId ? { branchId: scope.branchId } : {};

    const [reservationsByStatus, eventsByStatus, branches, topBranches] = await Promise.all([
      prisma.reservation.groupBy({
        by: ["status"],
        where: branchWhere,
        _count: { id: true },
      }),
      prisma.eventBooking.groupBy({
        by: ["status"],
        where: scope.branchId ? { venue: { branchId: scope.branchId } } : {},
        _count: { id: true },
      }),
      prisma.branch.findMany({
        where: scope.branchId ? { id: scope.branchId } : {},
        select: {
          id: true,
          name: true,
          _count: { select: { reservations: true, tables: true } },
        },
      }),
      scope.isSuperAdmin
        ? prisma.reservation.groupBy({
            by: ["branchId"],
            _count: { id: true },
            orderBy: { _count: { id: "desc" } },
            take: 5,
          })
        : Promise.resolve([]),
    ]);

    let branchNames: Record<string, string> = {};
    if (topBranches.length > 0) {
      const ids = topBranches.map((b) => b.branchId);
      const branchList = await prisma.branch.findMany({
        where: { id: { in: ids } },
        select: { id: true, name: true },
      });
      branchNames = Object.fromEntries(branchList.map((b) => [b.id, b.name]));
    }

    return {
      success: true as const,
      data: {
        reservationsByStatus,
        eventsByStatus,
        branches,
        topBranches: topBranches.map((b) => ({
          branchId: b.branchId,
          name: branchNames[b.branchId] ?? "Unknown",
          count: b._count.id,
        })),
      },
    };
  } catch (error) {
    return toActionError(error);
  }
}
