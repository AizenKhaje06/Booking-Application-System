"use server";

import { PaymentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import {
  createPayMongoCheckoutSession,
  isPayMongoConfigured,
  retrievePayMongoCheckoutSession,
} from "@/services/payment/paymongo";
import {
  completePaymentSuccess,
  extractPaidPaymentFromSession,
} from "@/services/payment/process-payment";
import { toActionError } from "@/utils/errors";

async function assertPaymentAccess(paymentId: string) {
  const user = await getCurrentUser();
  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      reservation: {
        include: { branch: true, table: true },
      },
      eventBooking: {
        include: { venue: true, package: true },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  const ownerId = payment.reservation?.customerId ?? payment.eventBooking?.customerId ?? null;

  if (ownerId !== user.id) {
    throw new Error("Forbidden");
  }

  return { payment, user };
}

export async function getPaymentForCheckout(paymentId: string) {
  try {
    const { payment } = await assertPaymentAccess(paymentId);

    return {
      success: true as const,
      data: {
        id: payment.id,
        amount: Number(payment.amount),
        status: payment.paymentStatus,
        bookingType: payment.bookingType,
        paymongoSessionId: payment.paymongoSessionId,
        failureReason: payment.failureReason,
        reservation: payment.reservation
          ? {
              id: payment.reservation.id,
              branchName: payment.reservation.branch.name,
              date: payment.reservation.reservationDate,
              time: payment.reservation.reservationTime,
              guestCount: payment.reservation.guestCount,
              tableNumber: payment.reservation.table?.tableNumber,
              status: payment.reservation.status,
            }
          : null,
        eventBooking: payment.eventBooking
          ? {
              id: payment.eventBooking.id,
              venueName: payment.eventBooking.venue.name,
              packageName: payment.eventBooking.packageName ?? payment.eventBooking.package?.name,
              eventDate: payment.eventBooking.eventDate,
              status: payment.eventBooking.status,
            }
          : null,
      },
    };
  } catch (error) {
    return toActionError(error);
  }
}

export async function initiateCheckout(paymentId: string) {
  try {
    const { payment, user } = await assertPaymentAccess(paymentId);

    if (payment.paymentStatus === PaymentStatus.PAID) {
      return {
        success: true as const,
        data: { alreadyPaid: true as const, checkoutUrl: null },
      };
    }

    if (payment.paymentStatus === PaymentStatus.FAILED) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { paymentStatus: PaymentStatus.PENDING, failureReason: null },
      });
    }

    if (payment.paymongoSessionId && isPayMongoConfigured()) {
      const existing = await retrievePayMongoCheckoutSession(payment.paymongoSessionId);
      const status = existing.data.attributes.status;
      if (status === "active" && existing.data.attributes.checkout_url) {
        return {
          success: true as const,
          data: {
            alreadyPaid: false as const,
            checkoutUrl: existing.data.attributes.checkout_url,
          },
        };
      }
    }

    if (!isPayMongoConfigured()) {
      return {
        success: true as const,
        data: { alreadyPaid: false as const, checkoutUrl: null, demoMode: true as const },
      };
    }

    const lineItemName =
      payment.bookingType === "RESERVATION"
        ? `Table reservation deposit — ${payment.reservation?.branch.name ?? "RestaurantHub"}`
        : `Event deposit — ${payment.eventBooking?.venue.name ?? "RestaurantHub"}`;

    const description =
      payment.bookingType === "RESERVATION"
        ? `Reservation deposit for ${payment.reservation?.guestCount ?? 0} guests`
        : `Event booking downpayment`;

    const session = await createPayMongoCheckoutSession({
      paymentId: payment.id,
      amountPhp: Number(payment.amount),
      description,
      lineItemName,
      customerEmail: user.email!,
      customerName: user.name ?? "Guest",
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { paymongoSessionId: session.sessionId },
    });

    return {
      success: true as const,
      data: { alreadyPaid: false as const, checkoutUrl: session.checkoutUrl },
    };
  } catch (error) {
    return toActionError(error);
  }
}

export async function verifyPaymentStatus(paymentId: string) {
  try {
    const { payment } = await assertPaymentAccess(paymentId);

    if (payment.paymentStatus === PaymentStatus.PAID) {
      return { success: true as const, data: { status: PaymentStatus.PAID } };
    }

    if (payment.paymongoSessionId && isPayMongoConfigured()) {
      const session = await retrievePayMongoCheckoutSession(payment.paymongoSessionId);
      const paidInfo = extractPaidPaymentFromSession(session.data.attributes);

      if (paidInfo) {
        await completePaymentSuccess({
          paymentId: payment.id,
          paymongoPaymentId: paidInfo.paymentId,
          paymongoSessionId: payment.paymongoSessionId,
          sourceType: paidInfo.sourceType,
        });

        revalidatePath("/payments/success");
        revalidatePath("/account/payments");
        revalidatePath("/account/reservations");
        revalidatePath("/account/events");

        return { success: true as const, data: { status: PaymentStatus.PAID } };
      }
    }

    return {
      success: true as const,
      data: { status: payment.paymentStatus },
    };
  } catch (error) {
    return toActionError(error);
  }
}

export async function completeDemoPayment(paymentId: string) {
  try {
    if (process.env.NODE_ENV === "production" && isPayMongoConfigured()) {
      return { success: false as const, error: "Demo payments are disabled in production" };
    }

    const { payment } = await assertPaymentAccess(paymentId);

    if (payment.paymentStatus === PaymentStatus.PAID) {
      return { success: true as const, data: { status: PaymentStatus.PAID } };
    }

    await completePaymentSuccess({
      paymentId: payment.id,
      paymongoPaymentId: `demo_${payment.id}`,
      sourceType: "gcash",
    });

    revalidatePath("/payments/success");
    revalidatePath("/account/payments");

    return { success: true as const, data: { status: PaymentStatus.PAID } };
  } catch (error) {
    return toActionError(error);
  }
}

export async function getCustomerPaymentHistory() {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false as const, error: "Unauthorized" };
    }

    const payments = await prisma.payment.findMany({
      where: {
        OR: [{ reservation: { customerId: user.id } }, { eventBooking: { customerId: user.id } }],
      },
      orderBy: { createdAt: "desc" },
      include: {
        reservation: {
          select: { id: true, branch: { select: { name: true } }, reservationDate: true },
        },
        eventBooking: {
          select: { id: true, venue: { select: { name: true } }, eventDate: true },
        },
      },
    });

    return { success: true as const, data: payments };
  } catch (error) {
    return toActionError(error);
  }
}

export async function getPaymentById(paymentId: string) {
  try {
    const { payment, user } = await assertPaymentAccess(paymentId);

    return {
      success: true as const,
      data: {
        payment,
        userEmail: user.email,
      },
    };
  } catch (error) {
    return toActionError(error);
  }
}
