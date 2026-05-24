"use server";

import { TableStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAdminScope, tableBranchFilter } from "@/lib/admin/scope";
import { prisma } from "@/lib/prisma";
import { toActionError } from "@/utils/errors";

export async function getAdminBranches() {
  try {
    const scope = await getAdminScope();

    const branches = await prisma.branch.findMany({
      where: scope.branchId ? { id: scope.branchId } : {},
      orderBy: [{ isMainBranch: "desc" }, { name: "asc" }],
      include: {
        _count: {
          select: {
            tables: true,
            reservations: true,
            eventVenues: true,
            staff: true,
          },
        },
      },
    });

    return { success: true as const, data: branches };
  } catch (error) {
    return toActionError(error);
  }
}

export async function getAdminBranchDetail(branchId: string) {
  try {
    const scope = await getAdminScope();

    if (scope.branchId && scope.branchId !== branchId) {
      return { success: false as const, error: "Forbidden" };
    }

    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
      include: {
        tables: { orderBy: [{ floor: "asc" }, { tableNumber: "asc" }] },
        eventVenues: { select: { id: true, name: true, slug: true, capacity: true } },
        _count: {
          select: {
            reservations: true,
            staff: true,
          },
        },
      },
    });

    if (!branch) {
      return { success: false as const, error: "Branch not found" };
    }

    const recentReservations = await prisma.reservation.findMany({
      where: { branchId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        customer: { select: { name: true } },
      },
    });

    const tableStats = await prisma.table.groupBy({
      by: ["status"],
      where: { branchId },
      _count: { id: true },
    });

    return {
      success: true as const,
      data: { branch, recentReservations, tableStats },
    };
  } catch (error) {
    return toActionError(error);
  }
}

export async function getAdminTables(branchId?: string) {
  try {
    const scope = await getAdminScope();
    const filter = tableBranchFilter(scope);

    const tables = await prisma.table.findMany({
      where: {
        ...filter,
        ...(branchId ? { branchId } : {}),
      },
      orderBy: [{ branchId: "asc" }, { floor: "asc" }, { tableNumber: "asc" }],
      include: {
        branch: { select: { name: true, slug: true } },
        _count: { select: { reservations: true } },
      },
    });

    return { success: true as const, data: tables };
  } catch (error) {
    return toActionError(error);
  }
}

const tableStatusSchema = z.object({
  tableId: z.string().min(1),
  status: z.nativeEnum(TableStatus),
});

export async function updateTableStatus(data: unknown) {
  try {
    const scope = await getAdminScope();
    const parsed = tableStatusSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false as const, error: parsed.error.issues[0]?.message };
    }

    const table = await prisma.table.findUnique({
      where: { id: parsed.data.tableId },
    });

    if (!table) {
      return { success: false as const, error: "Table not found" };
    }

    if (scope.branchId && table.branchId !== scope.branchId) {
      return { success: false as const, error: "Forbidden" };
    }

    const updated = await prisma.table.update({
      where: { id: parsed.data.tableId },
      data: { status: parsed.data.status },
    });

    revalidatePath("/admin/tables");
    revalidatePath("/admin");

    return { success: true as const, data: updated };
  } catch (error) {
    return toActionError(error);
  }
}
