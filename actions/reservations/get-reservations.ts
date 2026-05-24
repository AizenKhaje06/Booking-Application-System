"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { toActionError } from "@/utils/errors";

export async function getCustomerReservations() {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false as const, error: "Unauthorized" };
    }

    const reservations = await prisma.reservation.findMany({
      where: { customerId: user.id },
      orderBy: [{ reservationDate: "desc" }, { reservationTime: "desc" }],
      include: {
        branch: { select: { name: true, slug: true, image: true } },
        table: { select: { tableNumber: true, floor: true, capacity: true } },
      },
    });

    return { success: true as const, data: reservations };
  } catch (error) {
    return toActionError(error);
  }
}

export async function getReservationById(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false as const, error: "Unauthorized" };
    }

    const reservation = await prisma.reservation.findFirst({
      where: { id, customerId: user.id },
      include: {
        branch: true,
        table: true,
      },
    });

    if (!reservation) {
      return { success: false as const, error: "Reservation not found" };
    }

    return { success: true as const, data: reservation };
  } catch (error) {
    return toActionError(error);
  }
}
