import {
  NotificationChannel,
  NotificationJobStatus,
  NotificationType,
  type Prisma,
} from "@prisma/client";

import { clientEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { sendRawEmail } from "@/services/notifications/email-provider";
import {
  bookingReminderTemplate,
  cancellationNoticeTemplate,
  depositPendingTemplate,
  eventBookingConfirmationTemplate,
  eventInquiryTemplate,
  passwordResetTemplate,
  paymentFailedTemplate,
  paymentReceiptTemplate,
  reservationConfirmationTemplate,
} from "@/services/notifications/templates/emails";
import {
  otpSms,
  paymentReceiptSms,
  reservationReminderSms,
} from "@/services/notifications/templates/sms";
import { sendSms } from "@/services/notifications/sms-provider";

type JobPayload = Record<string, unknown>;

const EMAIL_SUBJECTS: Partial<Record<NotificationType, string>> = {
  RESERVATION_CONFIRMATION: "Reservation confirmed",
  EVENT_BOOKING_CONFIRMATION: "Event booking confirmed",
  PAYMENT_RECEIPT: "Payment receipt",
  BOOKING_REMINDER: "Upcoming booking reminder",
  CANCELLATION_NOTICE: "Booking cancelled",
  PASSWORD_RESET: "Reset your password",
  EVENT_INQUIRY: "Event inquiry received",
  PAYMENT_FAILED: "Payment failed",
  DEPOSIT_PENDING: "Complete your deposit",
};

function accountUrl(path = "/account") {
  return `${clientEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}${path}`;
}

export async function dispatchNotificationJob(
  type: NotificationType,
  channel: NotificationChannel,
  payload: JobPayload,
  recipientEmail?: string | null,
  recipientPhone?: string | null,
) {
  const baseUrl = accountUrl();

  switch (channel) {
    case NotificationChannel.EMAIL: {
      if (!recipientEmail) throw new Error("Email recipient required");
      let html = "";
      let subject = EMAIL_SUBJECTS[type] ?? "Notification from RestaurantHub";

      switch (type) {
        case NotificationType.RESERVATION_CONFIRMATION:
          html = reservationConfirmationTemplate({
            name: payload.name as string,
            reservation: payload.reservation as never,
            accountUrl: accountUrl("/account/reservations"),
          });
          subject = `Reservation confirmed — ${(payload.reservation as { branchName: string }).branchName}`;
          break;
        case NotificationType.EVENT_BOOKING_CONFIRMATION:
          html = eventBookingConfirmationTemplate({
            name: payload.name as string,
            booking: payload.booking as never,
            accountUrl: accountUrl("/account/events"),
          });
          subject = `Event confirmed — ${(payload.booking as { venueName: string }).venueName}`;
          break;
        case NotificationType.PAYMENT_RECEIPT:
          html = paymentReceiptTemplate({
            name: payload.name as string,
            receipt: payload.receipt as never,
            accountUrl: accountUrl("/account/payments"),
          });
          break;
        case NotificationType.BOOKING_REMINDER:
          html = bookingReminderTemplate({
            name: payload.name as string,
            booking: payload.booking as never,
            accountUrl: baseUrl,
          });
          break;
        case NotificationType.CANCELLATION_NOTICE:
          html = cancellationNoticeTemplate({
            name: payload.name as string,
            cancellation: payload.cancellation as never,
            accountUrl: baseUrl,
          });
          break;
        case NotificationType.PASSWORD_RESET:
          html = passwordResetTemplate({
            name: payload.name as string,
            resetUrl: payload.resetUrl as string,
          });
          break;
        case NotificationType.EVENT_INQUIRY:
          html = eventInquiryTemplate({
            name: payload.name as string,
            booking: payload.booking as never,
          });
          subject = `Event inquiry received — ${(payload.booking as { venueName: string }).venueName}`;
          break;
        case NotificationType.PAYMENT_FAILED:
          html = paymentFailedTemplate({
            name: payload.name as string,
            payment: payload.payment as never,
            retryUrl: payload.retryUrl as string,
          });
          break;
        case NotificationType.DEPOSIT_PENDING:
          html = depositPendingTemplate({
            name: payload.name as string,
            deposit: payload.deposit as never,
            checkoutUrl: payload.checkoutUrl as string,
          });
          break;
        default:
          throw new Error(`Unsupported email type: ${type}`);
      }

      return sendRawEmail({ to: recipientEmail, subject, html });
    }

    case NotificationChannel.SMS: {
      if (!recipientPhone) throw new Error("Phone recipient required");
      let body = "";

      switch (type) {
        case NotificationType.RESERVATION_REMINDER_SMS:
          body = reservationReminderSms(payload as never);
          break;
        case NotificationType.OTP_VERIFICATION:
          body = otpSms({ code: payload.code as string });
          break;
        case NotificationType.PAYMENT_RECEIPT:
          body = paymentReceiptSms({
            amount: payload.amount as number,
            description: payload.description as string,
          });
          break;
        default:
          throw new Error(`Unsupported SMS type: ${type}`);
      }

      return sendSms({ to: recipientPhone, body });
    }

    default:
      throw new Error(`Unsupported channel: ${channel}`);
  }
}

export async function createInAppNotification({
  userId,
  title,
  message,
  type,
}: {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
}) {
  return prisma.notification.create({
    data: { userId, title, message, type },
  });
}

export type EnqueueOptions = {
  type: NotificationType;
  channel: NotificationChannel;
  payload: JobPayload;
  recipientEmail?: string;
  recipientPhone?: string;
  userId?: string;
  scheduledAt?: Date;
  idempotencyKey?: string;
  maxAttempts?: number;
};

export async function enqueueNotification(options: EnqueueOptions) {
  const data: Prisma.NotificationJobCreateInput = {
    type: options.type,
    channel: options.channel,
    payload: options.payload as Prisma.InputJsonValue,
    recipientEmail: options.recipientEmail,
    recipientPhone: options.recipientPhone,
    scheduledAt: options.scheduledAt ?? new Date(),
    maxAttempts: options.maxAttempts ?? 3,
    ...(options.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : {}),
    ...(options.userId ? { user: { connect: { id: options.userId } } } : {}),
  };

  if (options.idempotencyKey) {
    const existing = await prisma.notificationJob.findUnique({
      where: { idempotencyKey: options.idempotencyKey },
    });
    if (existing) return existing;
  }

  return prisma.notificationJob.create({ data });
}

function retryDelayMs(attempts: number) {
  return Math.min(60_000 * 2 ** attempts, 30 * 60_000);
}

export async function processNotificationJob(jobId: string) {
  const job = await prisma.notificationJob.findUnique({ where: { id: jobId } });
  if (!job) return { processed: false, reason: "not_found" as const };
  if (job.status === NotificationJobStatus.COMPLETED) {
    return { processed: false, reason: "already_completed" as const };
  }
  if (job.status === NotificationJobStatus.CANCELLED) {
    return { processed: false, reason: "cancelled" as const };
  }
  if (job.scheduledAt > new Date()) {
    return { processed: false, reason: "not_due" as const };
  }

  await prisma.notificationJob.update({
    where: { id: jobId },
    data: { status: NotificationJobStatus.PROCESSING },
  });

  try {
    if (job.channel === NotificationChannel.IN_APP) {
      await prisma.notificationJob.update({
        where: { id: jobId },
        data: {
          status: NotificationJobStatus.COMPLETED,
          sentAt: new Date(),
          attempts: { increment: 1 },
        },
      });
      return { processed: true };
    }

    await dispatchNotificationJob(
      job.type,
      job.channel,
      job.payload as JobPayload,
      job.recipientEmail,
      job.recipientPhone,
    );

    await prisma.notificationJob.update({
      where: { id: jobId },
      data: {
        status: NotificationJobStatus.COMPLETED,
        sentAt: new Date(),
        attempts: { increment: 1 },
        lastError: null,
      },
    });

    return { processed: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const nextAttempts = job.attempts + 1;
    const failed = nextAttempts >= job.maxAttempts;

    await prisma.notificationJob.update({
      where: { id: jobId },
      data: {
        status: failed ? NotificationJobStatus.FAILED : NotificationJobStatus.PENDING,
        attempts: nextAttempts,
        lastError: message,
        scheduledAt: failed ? job.scheduledAt : new Date(Date.now() + retryDelayMs(nextAttempts)),
      },
    });

    return { processed: false, error: message, failed };
  }
}

export async function processPendingNotificationJobs(limit = 20) {
  const jobs = await prisma.notificationJob.findMany({
    where: {
      status: NotificationJobStatus.PENDING,
      scheduledAt: { lte: new Date() },
    },
    orderBy: { scheduledAt: "asc" },
    take: limit,
  });

  const results = [];
  for (const job of jobs) {
    results.push(await processNotificationJob(job.id));
  }

  return { processed: results.filter((r) => r.processed).length, total: jobs.length, results };
}

/** Enqueue and attempt immediate delivery (non-blocking for callers). */
export async function notify(options: EnqueueOptions) {
  const job = await enqueueNotification(options);
  processNotificationJob(job.id).catch((err) =>
    console.error("[notifications] immediate process failed:", err),
  );
  return job;
}

export async function notifySync(options: EnqueueOptions) {
  const job = await enqueueNotification(options);
  await processNotificationJob(job.id);
  return job;
}
