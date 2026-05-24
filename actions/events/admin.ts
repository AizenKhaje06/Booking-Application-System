"use server";

import { EventBookingStatus, PaymentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { formatDate, formatTimeDisplay } from "@/lib/booking/display";
import { EVENT_TYPE_LABELS } from "@/lib/events/constants";
import { getAdminScope, venueBranchFilter } from "@/lib/admin/scope";
import { prisma } from "@/lib/prisma";
import { adminReviewSchema } from "@/lib/validations/event-booking";
import { requireAdmin } from "@/lib/session";
import {
  sendEventBookingConfirmation,
  notifyStatusUpdate,
  sendCancellationNotice,
} from "@/services/notifications";
import { toActionError } from "@/utils/errors";

export async function getPendingEventBookings() {
  try {
    const scope = await getAdminScope();

    const bookings = await prisma.eventBooking.findMany({
      where: { status: EventBookingStatus.PENDING, ...venueBranchFilter(scope) },
      orderBy: { createdAt: "asc" },
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        venue: { select: { name: true, slug: true } },
        package: { select: { name: true, price: true } },
      },
    });

    return { success: true as const, data: bookings };
  } catch (error) {
    return toActionError(error);
  }
}

export async function getAllEventBookingsForAdmin() {
  try {
    const scope = await getAdminScope();

    const bookings = await prisma.eventBooking.findMany({
      where: venueBranchFilter(scope),
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        customer: { select: { name: true, email: true } },
        venue: { select: { name: true } },
        package: { select: { name: true } },
      },
    });

    return { success: true as const, data: bookings };
  } catch (error) {
    return toActionError(error);
  }
}

export async function reviewEventBooking(data: unknown) {
  try {
    await requireAdmin();

    const parsed = adminReviewSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false as const, error: parsed.error.issues[0]?.message };
    }

    const { bookingId, action, adminNotes } = parsed.data;

    const booking = await prisma.eventBooking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        venue: { include: { branch: true } },
        package: true,
      },
    });

    if (!booking || booking.status !== EventBookingStatus.PENDING) {
      return { success: false as const, error: "Booking not found or already reviewed" };
    }

    const scope = await getAdminScope();
    if (scope.branchId && booking.venue.branchId !== scope.branchId) {
      return { success: false as const, error: "Forbidden" };
    }

    const newStatus =
      action === "approve" ? EventBookingStatus.CONFIRMED : EventBookingStatus.REJECTED;

    if (action === "approve") {
      const depositPaid = await prisma.payment.findFirst({
        where: { eventBookingId: bookingId, paymentStatus: PaymentStatus.PAID },
      });

      if (!depositPaid) {
        return {
          success: false as const,
          error: "Cannot approve — customer has not paid the deposit yet.",
        };
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.eventBooking.update({
        where: { id: bookingId },
        data: {
          status: newStatus,
          adminNotes: adminNotes ?? null,
        },
      });

      if (action === "reject") {
        await tx.payment.updateMany({
          where: { eventBookingId: bookingId, paymentStatus: PaymentStatus.PENDING },
          data: { paymentStatus: PaymentStatus.CANCELLED },
        });
      }

      return result;
    });

    if (action === "approve") {
      await sendEventBookingConfirmation({
        userId: booking.customerId,
        to: booking.customer.email,
        name: booking.customer.name,
        booking: {
          id: booking.id,
          venueName: booking.venue.name,
          eventType: EVENT_TYPE_LABELS[booking.eventType],
          date: formatDate(booking.eventDate),
          startTime: formatTimeDisplay(booking.startTime),
          endTime: formatTimeDisplay(booking.endTime),
          packageName: booking.packageName ?? booking.package?.name ?? "Event Package",
          totalPrice: Number(booking.totalPrice),
          depositAmount: Number(booking.depositAmount ?? 0),
        },
      });

      await notifyStatusUpdate({
        userId: booking.customerId,
        title: "Event booking approved",
        message: `Your event at ${booking.venue.name} on ${formatDate(booking.eventDate)} has been confirmed!`,
      });
    } else {
      await sendCancellationNotice({
        userId: booking.customerId,
        to: booking.customer.email,
        name: booking.customer.name,
        kind: "event",
        title: `${EVENT_TYPE_LABELS[booking.eventType]} at ${booking.venue.name}`,
        date: formatDate(booking.eventDate),
        reason: adminNotes,
        bookingId: booking.id,
      });
    }

    revalidatePath("/admin/events");
    revalidatePath("/account/events");

    return { success: true as const, data: { status: updated.status } };
  } catch (error) {
    return toActionError(error);
  }
}
