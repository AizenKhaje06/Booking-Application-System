export {
  createInAppNotification,
  enqueueNotification,
  notify,
  notifySync,
  processNotificationJob,
  processPendingNotificationJobs,
} from "@/services/notifications/queue";

export { scheduleBookingReminders } from "@/services/notifications/reminders";

import { NotificationChannel, NotificationType } from "@prisma/client";
import { format } from "date-fns";

import { clientEnv } from "@/lib/env";
import { PAYMENT_METHOD_LABELS } from "@/lib/payment/constants";
import { createInAppNotification, notify } from "@/services/notifications/queue";

const appUrl = () => clientEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");

export async function sendReservationConfirmation(params: {
  userId: string;
  to: string;
  name: string;
  reservation: {
    id: string;
    branchName: string;
    branchAddress: string;
    date: string;
    time: string;
    guestCount: number;
    tableNumber: string;
    floor?: number;
    notes?: string | null;
  };
}) {
  await notify({
    type: NotificationType.RESERVATION_CONFIRMATION,
    channel: NotificationChannel.EMAIL,
    recipientEmail: params.to,
    userId: params.userId,
    idempotencyKey: `reservation-confirm:${params.reservation.id}`,
    payload: { name: params.name, reservation: params.reservation },
  });
}

export async function sendEventBookingConfirmation(params: {
  userId: string;
  to: string;
  name: string;
  booking: {
    id: string;
    venueName: string;
    eventType: string;
    date: string;
    startTime: string;
    endTime: string;
    packageName: string;
    totalPrice: number;
    depositAmount: number;
  };
}) {
  await notify({
    type: NotificationType.EVENT_BOOKING_CONFIRMATION,
    channel: NotificationChannel.EMAIL,
    recipientEmail: params.to,
    userId: params.userId,
    idempotencyKey: `event-confirm:${params.booking.id}`,
    payload: { name: params.name, booking: params.booking },
  });
}

export async function sendPaymentReceipt(params: {
  userId: string;
  to: string;
  phone?: string | null;
  name: string;
  paymentId: string;
  amount: number;
  method: string;
  description: string;
  transactionId?: string | null;
}) {
  const receipt = {
    paymentId: params.paymentId,
    amount: params.amount,
    method: PAYMENT_METHOD_LABELS[params.method] ?? params.method,
    date: format(new Date(), "PPpp"),
    description: params.description,
    transactionId: params.transactionId,
  };

  await notify({
    type: NotificationType.PAYMENT_RECEIPT,
    channel: NotificationChannel.EMAIL,
    recipientEmail: params.to,
    userId: params.userId,
    idempotencyKey: `receipt:email:${params.paymentId}`,
    payload: { name: params.name, receipt },
  });

  if (params.phone) {
    await notify({
      type: NotificationType.PAYMENT_RECEIPT,
      channel: NotificationChannel.SMS,
      recipientPhone: params.phone,
      userId: params.userId,
      idempotencyKey: `receipt:sms:${params.paymentId}`,
      payload: { amount: params.amount, description: params.description },
    });
  }
}

export async function sendEventInquiryReceived(params: {
  userId: string;
  to: string;
  name: string;
  booking: {
    id: string;
    venueName: string;
    eventType: string;
    date: string;
    startTime: string;
    endTime: string;
    packageName: string;
    depositAmount: number;
    totalPrice: number;
  };
}) {
  await notify({
    type: NotificationType.EVENT_INQUIRY,
    channel: NotificationChannel.EMAIL,
    recipientEmail: params.to,
    userId: params.userId,
    idempotencyKey: `event-inquiry:${params.booking.id}`,
    payload: { name: params.name, booking: params.booking },
  });
}

export async function sendPasswordReset(params: { to: string; name: string; resetUrl: string }) {
  await notify({
    type: NotificationType.PASSWORD_RESET,
    channel: NotificationChannel.EMAIL,
    recipientEmail: params.to,
    idempotencyKey: `password-reset:${params.to}:${Date.now()}`,
    payload: { name: params.name, resetUrl: params.resetUrl },
  });
}

export async function sendDepositPending(params: {
  userId: string;
  to: string;
  name: string;
  paymentId: string;
  amount: number;
  description: string;
}) {
  await notify({
    type: NotificationType.DEPOSIT_PENDING,
    channel: NotificationChannel.EMAIL,
    recipientEmail: params.to,
    userId: params.userId,
    idempotencyKey: `deposit-pending:${params.paymentId}`,
    payload: {
      name: params.name,
      deposit: { amount: params.amount, description: params.description },
      checkoutUrl: `${appUrl()}/payments/checkout?paymentId=${params.paymentId}`,
    },
  });
}

export async function sendPaymentFailed(params: {
  userId: string;
  to: string;
  name: string;
  paymentId: string;
  amount: number;
  description: string;
  reason?: string | null;
}) {
  await notify({
    type: NotificationType.PAYMENT_FAILED,
    channel: NotificationChannel.EMAIL,
    recipientEmail: params.to,
    userId: params.userId,
    idempotencyKey: `payment-failed:${params.paymentId}`,
    payload: {
      name: params.name,
      payment: { amount: params.amount, description: params.description, reason: params.reason },
      retryUrl: `${appUrl()}/payments/checkout?paymentId=${params.paymentId}`,
    },
  });
}

export async function sendCancellationNotice(params: {
  userId: string;
  to: string;
  name: string;
  kind: "reservation" | "event";
  title: string;
  date: string;
  reason?: string | null;
  bookingId: string;
}) {
  await notify({
    type: NotificationType.CANCELLATION_NOTICE,
    channel: NotificationChannel.EMAIL,
    recipientEmail: params.to,
    userId: params.userId,
    idempotencyKey: `cancel:${params.kind}:${params.bookingId}`,
    payload: {
      name: params.name,
      cancellation: {
        kind: params.kind,
        title: params.title,
        date: params.date,
        reason: params.reason,
      },
    },
  });

  await createInAppNotification({
    userId: params.userId,
    title: "Booking cancelled",
    message: `Your ${params.title} on ${params.date} has been cancelled.`,
    type: NotificationType.CANCELLATION_NOTICE,
  });
}

export async function sendOtpSms(params: { phone: string; code: string }) {
  await notify({
    type: NotificationType.OTP_VERIFICATION,
    channel: NotificationChannel.SMS,
    recipientPhone: params.phone,
    payload: { code: params.code },
    maxAttempts: 2,
  });
}

export async function notifyStatusUpdate(params: {
  userId: string;
  title: string;
  message: string;
}) {
  await createInAppNotification({
    userId: params.userId,
    title: params.title,
    message: params.message,
    type: NotificationType.STATUS_UPDATE,
  });
}
