import { BookingType, PaymentStatus, ReservationStatus } from "@prisma/client";

import { formatDate, formatTimeDisplay } from "@/lib/booking/display";
import { EVENT_TYPE_LABELS } from "@/lib/events/constants";
import { mapPayMongoSourceToMethod } from "@/lib/payment/types";
import { prisma } from "@/lib/prisma";
import {
  notifyStatusUpdate,
  sendEventInquiryReceived,
  sendPaymentFailed,
  sendPaymentReceipt,
  sendReservationConfirmation,
} from "@/services/notifications";

interface CompletePaymentInput {
  paymentId: string;
  paymongoPaymentId?: string;
  paymongoSessionId?: string;
  sourceType?: string | null;
  failureReason?: string;
}

export async function completePaymentSuccess(input: CompletePaymentInput) {
  const payment = await prisma.payment.findUnique({
    where: { id: input.paymentId },
    include: {
      reservation: {
        include: { branch: true, table: true, customer: true },
      },
      eventBooking: {
        include: { venue: true, package: true, customer: true },
      },
    },
  });

  if (!payment) {
    return { updated: false, reason: "payment_not_found" as const };
  }

  if (payment.paymentStatus === PaymentStatus.PAID) {
    return { updated: false, reason: "already_paid" as const, payment };
  }

  const method = mapPayMongoSourceToMethod(input.sourceType);

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        paymentStatus: PaymentStatus.PAID,
        paymentMethod: method,
        transactionId: input.paymongoPaymentId ?? payment.transactionId,
        paymongoSessionId: input.paymongoSessionId ?? payment.paymongoSessionId,
        failureReason: null,
      },
    });

    if (payment.bookingType === BookingType.RESERVATION && payment.reservation) {
      await tx.reservation.update({
        where: { id: payment.reservation.id },
        data: { status: ReservationStatus.CONFIRMED },
      });
    }
  });

  if (payment.bookingType === BookingType.RESERVATION && payment.reservation) {
    const reservation = payment.reservation;
    const description = `Table reservation deposit — ${reservation.branch.name}`;

    await sendPaymentReceipt({
      userId: reservation.customerId,
      to: reservation.customer.email,
      phone: reservation.customer.phone,
      name: reservation.customer.name,
      paymentId: payment.id,
      amount: Number(payment.amount),
      method: method,
      description,
      transactionId: input.paymongoPaymentId,
    });

    await sendReservationConfirmation({
      userId: reservation.customerId,
      to: reservation.customer.email,
      name: reservation.customer.name,
      reservation: {
        id: reservation.id,
        branchName: reservation.branch.name,
        branchAddress: reservation.branch.address,
        date: formatDate(reservation.reservationDate),
        time: formatTimeDisplay(reservation.reservationTime),
        guestCount: reservation.guestCount,
        tableNumber: reservation.table?.tableNumber ?? "—",
        floor: reservation.table?.floor,
        notes: reservation.notes,
      },
    });

    await notifyStatusUpdate({
      userId: reservation.customerId,
      title: "Payment received — reservation confirmed",
      message: `Your deposit of ₱${Number(payment.amount)} was received. Table ${reservation.table?.tableNumber ?? ""} at ${reservation.branch.name} is confirmed.`,
    });
  }

  if (payment.bookingType === BookingType.EVENT_BOOKING && payment.eventBooking) {
    const booking = payment.eventBooking;
    const description = `Event deposit — ${booking.venue.name}`;

    await sendPaymentReceipt({
      userId: booking.customerId,
      to: booking.customer.email,
      phone: booking.customer.phone,
      name: booking.customer.name,
      paymentId: payment.id,
      amount: Number(payment.amount),
      method: method,
      description,
      transactionId: input.paymongoPaymentId,
    });

    await sendEventInquiryReceived({
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
        depositAmount: Number(booking.depositAmount ?? payment.amount),
        totalPrice: Number(booking.totalPrice),
      },
    });

    await notifyStatusUpdate({
      userId: booking.customerId,
      title: "Event deposit received",
      message: `Your deposit of ₱${Number(payment.amount)} for ${booking.venue.name} was received. Your inquiry remains pending admin approval.`,
    });
  }

  return { updated: true, payment };
}

export async function markPaymentFailed(input: {
  paymentId: string;
  failureReason?: string;
  paymongoSessionId?: string;
}) {
  const payment = await prisma.payment.findUnique({
    where: { id: input.paymentId },
    include: {
      reservation: { include: { customer: true, branch: true } },
      eventBooking: { include: { customer: true, venue: true } },
    },
  });

  if (!payment || payment.paymentStatus === PaymentStatus.PAID) {
    return { updated: false };
  }

  await prisma.payment.update({
    where: { id: input.paymentId },
    data: {
      paymentStatus: PaymentStatus.FAILED,
      failureReason: input.failureReason ?? "Payment failed",
      paymongoSessionId: input.paymongoSessionId ?? payment.paymongoSessionId,
    },
  });

  const customer = payment.reservation?.customer ?? payment.eventBooking?.customer;
  if (customer) {
    const description = payment.reservation
      ? `Table reservation — ${payment.reservation.branch.name}`
      : `Event deposit — ${payment.eventBooking!.venue.name}`;

    await sendPaymentFailed({
      userId: customer.id,
      to: customer.email,
      name: customer.name,
      paymentId: payment.id,
      amount: Number(payment.amount),
      description,
      reason: input.failureReason,
    });
  }

  return { updated: true };
}

export async function cancelPendingPayment(paymentId: string) {
  await prisma.payment.updateMany({
    where: { id: paymentId, paymentStatus: PaymentStatus.PENDING },
    data: { paymentStatus: PaymentStatus.CANCELLED },
  });
}

export function extractPaymentIdFromCheckoutSession(
  attributes: Record<string, unknown>,
): string | null {
  const metadata = attributes.metadata as Record<string, string> | undefined;
  if (metadata?.paymentId) return metadata.paymentId;

  const reference = attributes.reference_number as string | undefined;
  return reference ?? null;
}

export function extractPaidPaymentFromSession(attributes: {
  payments?: { id: string; attributes: { status: string; source?: { type?: string } } }[];
}) {
  const paid = attributes.payments?.find((p) => p.attributes.status === "paid");
  if (!paid) return null;
  return {
    paymentId: paid.id,
    sourceType: paid.attributes.source?.type ?? null,
  };
}
