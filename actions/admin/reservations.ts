"use server";

import { ReservationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { getAdminScope, reservationBranchFilter } from "@/lib/admin/scope";
import { formatDate } from "@/lib/booking/display";
import { prisma } from "@/lib/prisma";
import { notifyStatusUpdate, sendCancellationNotice } from "@/services/notifications";
import { requireAdmin } from "@/lib/session";
import { toActionError } from "@/utils/errors";
import { z } from "zod";

const updateStatusSchema = z.object({
  reservationId: z.string().min(1),
  status: z.nativeEnum(ReservationStatus),
});

export async function getAdminReservations() {
  try {
    const scope = await getAdminScope();

    const reservations = await prisma.reservation.findMany({
      where: reservationBranchFilter(scope),
      orderBy: [{ reservationDate: "desc" }, { createdAt: "desc" }],
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        branch: { select: { name: true, slug: true } },
        table: { select: { tableNumber: true, capacity: true } },
      },
    });

    return { success: true as const, data: reservations };
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateReservationStatus(data: unknown) {
  try {
    const scope = await getAdminScope();
    const parsed = updateStatusSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false as const, error: parsed.error.issues[0]?.message };
    }

    const { reservationId, status } = parsed.data;

    const existing = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { customer: true, branch: true },
    });

    if (!existing) {
      return { success: false as const, error: "Reservation not found" };
    }

    if (scope.branchId && existing.branchId !== scope.branchId) {
      return { success: false as const, error: "Forbidden" };
    }

    const updated = await prisma.reservation.update({
      where: { id: reservationId },
      data: { status },
    });

    const statusLabel = status.toLowerCase().replace("_", " ");

    if (status === ReservationStatus.CANCELLED) {
      await sendCancellationNotice({
        userId: existing.customerId,
        to: existing.customer.email,
        name: existing.customer.name,
        kind: "reservation",
        title: `Table at ${existing.branch.name}`,
        date: formatDate(existing.reservationDate),
        bookingId: existing.id,
      });
    } else {
      await notifyStatusUpdate({
        userId: existing.customerId,
        title: "Reservation updated",
        message: `Your reservation at ${existing.branch.name} is now ${statusLabel}.`,
      });
    }

    revalidatePath("/admin");
    revalidatePath("/admin/reservations");

    return { success: true as const, data: updated };
  } catch (error) {
    return toActionError(error);
  }
}

export async function getAdminBranchesForFilter() {
  try {
    await requireAdmin();
    const scope = await getAdminScope();

    const branches = await prisma.branch.findMany({
      where: scope.branchId ? { id: scope.branchId } : {},
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    });

    return { success: true as const, data: branches };
  } catch (error) {
    return toActionError(error);
  }
}
