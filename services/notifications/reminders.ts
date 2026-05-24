import {
  EventBookingStatus,
  NotificationChannel,
  NotificationType,
  ReservationStatus,
} from "@prisma/client";
import { addDays, format, startOfDay } from "date-fns";

import { formatDate, formatTimeDisplay } from "@/lib/booking/display";
import { EVENT_TYPE_LABELS } from "@/lib/events/constants";
import { prisma } from "@/lib/prisma";
import { enqueueNotification } from "@/services/notifications/queue";

const REMINDER_HOURS_AHEAD = 24;

export async function scheduleBookingReminders() {
  const now = new Date();
  const windowStart = addDays(startOfDay(now), 1);
  const windowEnd = addDays(windowStart, 1);

  const [reservations, events] = await Promise.all([
    prisma.reservation.findMany({
      where: {
        status: ReservationStatus.CONFIRMED,
        reservationDate: { gte: windowStart, lt: windowEnd },
      },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        branch: { select: { name: true, address: true } },
      },
    }),
    prisma.eventBooking.findMany({
      where: {
        status: EventBookingStatus.CONFIRMED,
        eventDate: { gte: windowStart, lt: windowEnd },
      },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        venue: { select: { name: true } },
      },
    }),
  ]);

  let scheduled = 0;

  for (const r of reservations) {
    const dateStr = formatDate(r.reservationDate);
    const timeStr = formatTimeDisplay(r.reservationTime);
    const idKey = `reminder:reservation:${r.id}:${format(r.reservationDate, "yyyy-MM-dd")}`;

    await enqueueNotification({
      type: NotificationType.BOOKING_REMINDER,
      channel: NotificationChannel.EMAIL,
      recipientEmail: r.customer.email,
      userId: r.customer.id,
      idempotencyKey: `${idKey}:email`,
      payload: {
        name: r.customer.name,
        booking: {
          kind: "reservation",
          title: `Table at ${r.branch.name}`,
          date: dateStr,
          time: timeStr,
          location: r.branch.address,
        },
      },
    });
    scheduled++;

    if (r.customer.phone) {
      await enqueueNotification({
        type: NotificationType.RESERVATION_REMINDER_SMS,
        channel: NotificationChannel.SMS,
        recipientPhone: r.customer.phone,
        userId: r.customer.id,
        idempotencyKey: `${idKey}:sms`,
        payload: { branchName: r.branch.name, date: dateStr, time: timeStr },
      });
      scheduled++;
    }
  }

  for (const e of events) {
    const dateStr = formatDate(e.eventDate);
    const idKey = `reminder:event:${e.id}:${format(e.eventDate, "yyyy-MM-dd")}`;

    await enqueueNotification({
      type: NotificationType.BOOKING_REMINDER,
      channel: NotificationChannel.EMAIL,
      recipientEmail: e.customer.email,
      userId: e.customer.id,
      idempotencyKey: `${idKey}:email`,
      payload: {
        name: e.customer.name,
        booking: {
          kind: "event",
          title: `${EVENT_TYPE_LABELS[e.eventType]} at ${e.venue.name}`,
          date: dateStr,
          time: `${formatTimeDisplay(e.startTime)} – ${formatTimeDisplay(e.endTime)}`,
          location: e.venue.name,
        },
      },
    });
    scheduled++;
  }

  return { scheduled, reservations: reservations.length, events: events.length };
}

export { REMINDER_HOURS_AHEAD };
