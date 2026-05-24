"use server";

import {
  BookingType,
  PaymentMethod,
  PaymentStatus,
  ReservationStatus,
  TableStatus,
} from "@prisma/client";
import { startOfDay } from "date-fns";
import { revalidatePath } from "next/cache";

import { calculateReservationDeposit } from "@/lib/payment/constants";
import { getBookedTableIds } from "@/services/reservations/availability";
import { sendDepositPending, notifyStatusUpdate } from "@/services/notifications";
import { prisma } from "@/lib/prisma";
import { createReservationSchema } from "@/lib/validations/reservation";
import { getCurrentUser } from "@/lib/session";
import { toActionError } from "@/utils/errors";

export async function createReservation(data: unknown) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false as const, error: "Please sign in to make a reservation" };
    }

    const parsed = createReservationSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false as const,
        error: parsed.error.issues[0]?.message ?? "Invalid reservation data",
      };
    }

    const { branchId, tableId, reservationDate, reservationTime, guestCount, notes } = parsed.data;

    const depositAmount = calculateReservationDeposit(guestCount);

    const result = await prisma.$transaction(async (tx) => {
      const bookedIds = await getBookedTableIds(branchId, reservationDate, reservationTime);

      if (bookedIds.has(tableId)) {
        throw new Error("TABLE_TAKEN");
      }

      const table = await tx.table.findFirst({
        where: {
          id: tableId,
          branchId,
          capacity: { gte: guestCount },
          status: TableStatus.AVAILABLE,
        },
      });

      if (!table) {
        throw new Error("TABLE_INVALID");
      }

      const reservation = await tx.reservation.create({
        data: {
          customerId: user.id,
          branchId,
          tableId,
          guestCount,
          reservationDate: startOfDay(new Date(reservationDate)),
          reservationTime,
          status: ReservationStatus.PENDING,
          notes: notes ?? null,
          depositAmount,
        },
        include: {
          branch: { select: { name: true } },
        },
      });

      const payment = await tx.payment.create({
        data: {
          bookingType: BookingType.RESERVATION,
          bookingId: reservation.id,
          reservationId: reservation.id,
          amount: depositAmount,
          paymentMethod: PaymentMethod.PAYMONGO,
          paymentStatus: PaymentStatus.PENDING,
        },
      });

      return { reservation, payment };
    });

    await sendDepositPending({
      userId: user.id,
      to: user.email!,
      name: user.name ?? "Guest",
      paymentId: result.payment.id,
      amount: depositAmount,
      description: `Table reservation at ${result.reservation.branch.name}`,
    });

    await notifyStatusUpdate({
      userId: user.id,
      title: "Complete your reservation deposit",
      message: `Pay your ₱${depositAmount} deposit to confirm your table at ${result.reservation.branch.name}.`,
    });

    revalidatePath("/account");
    revalidatePath("/account/reservations");

    return {
      success: true as const,
      data: {
        id: result.reservation.id,
        paymentId: result.payment.id,
        depositAmount,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "TABLE_TAKEN") {
        return {
          success: false as const,
          error: "This table was just booked. Please select another.",
        };
      }
      if (error.message === "TABLE_INVALID") {
        return {
          success: false as const,
          error: "This table is not available for your party size.",
        };
      }
    }
    return toActionError(error);
  }
}
