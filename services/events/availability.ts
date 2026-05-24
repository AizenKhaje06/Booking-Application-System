import { EventBookingStatus } from "@prisma/client";
import { startOfDay } from "date-fns";

import { prisma } from "@/lib/prisma";

const BLOCKING_STATUSES: EventBookingStatus[] = [
  EventBookingStatus.PENDING,
  EventBookingStatus.CONFIRMED,
];

export async function getVenueBySlug(slug: string) {
  return prisma.eventVenue.findUnique({
    where: { slug },
    include: {
      branch: { select: { name: true, address: true, slug: true, isMainBranch: true } },
      packages: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getMainVenue() {
  return prisma.eventVenue.findFirst({
    where: { branch: { isMainBranch: true } },
    include: {
      branch: true,
      packages: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getBookedDatesForVenue(
  venueId: string,
  year: number,
  month: number,
): Promise<string[]> {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);

  const bookings = await prisma.eventBooking.findMany({
    where: {
      venueId,
      status: { in: BLOCKING_STATUSES },
      eventDate: { gte: start, lte: end },
    },
    select: { eventDate: true },
  });

  const dates = new Set<string>();
  for (const b of bookings) {
    dates.add(b.eventDate.toISOString().slice(0, 10));
  }
  return [...dates];
}

export async function isVenueAvailable(
  venueId: string,
  dateIso: string,
  startTime: string,
  endTime: string,
  excludeBookingId?: string,
): Promise<boolean> {
  const eventDate = startOfDay(new Date(dateIso));
  const start = parseTime(startTime);
  const end = parseTime(endTime);

  const bookings = await prisma.eventBooking.findMany({
    where: {
      venueId,
      eventDate,
      status: { in: BLOCKING_STATUSES },
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
    },
    select: { startTime: true, endTime: true },
  });

  return !bookings.some((b) => {
    const bStart = parseTime(b.startTime);
    const bEnd = parseTime(b.endTime);
    return start < bEnd && bStart < end;
  });
}

function parseTime(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export async function getVenueAvailabilityMonth(venueId: string, year: number, month: number) {
  const bookedDates = await getBookedDatesForVenue(venueId, year, month);
  return { bookedDates };
}
