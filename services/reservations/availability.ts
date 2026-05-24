import { ReservationStatus, TableStatus } from "@prisma/client";
import { startOfDay } from "date-fns";

import { BLOCKING_RESERVATION_STATUSES } from "@/lib/booking/constants";
import { filterPastTimeSlots, generateTimeSlots, timesOverlap } from "@/lib/booking/time-slots";
import { prisma } from "@/lib/prisma";
import { type OpeningHours } from "@/types/database";

export type AvailableTable = {
  id: string;
  tableNumber: string;
  capacity: number;
  floor: number;
};

export async function getBranchForBooking(branchId: string) {
  return prisma.branch.findUnique({
    where: { id: branchId },
    select: {
      id: true,
      name: true,
      slug: true,
      address: true,
      image: true,
      openingHours: true,
      isMainBranch: true,
    },
  });
}

export async function getBranchesForBooking() {
  return prisma.branch.findMany({
    orderBy: [{ isMainBranch: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      address: true,
      image: true,
      isMainBranch: true,
    },
  });
}

export async function getTimeSlotsForBranch(branchId: string, dateIso: string) {
  const branch = await getBranchForBooking(branchId);
  if (!branch) return { slots: [], branch: null };

  const date = startOfDay(new Date(dateIso));
  const openingHours = branch.openingHours as OpeningHours;
  const slots = filterPastTimeSlots(generateTimeSlots(openingHours, date), date);

  return { slots, branch };
}

/** Tables already reserved (overlapping) for branch + date + time */
export async function getBookedTableIds(
  branchId: string,
  dateIso: string,
  time: string,
): Promise<Set<string>> {
  const reservationDate = startOfDay(new Date(dateIso));

  const reservations = await prisma.reservation.findMany({
    where: {
      branchId,
      reservationDate,
      status: {
        in: BLOCKING_RESERVATION_STATUSES as unknown as ReservationStatus[],
      },
      tableId: { not: null },
    },
    select: { tableId: true, reservationTime: true },
  });

  const booked = new Set<string>();
  for (const r of reservations) {
    if (r.tableId && timesOverlap(r.reservationTime, time)) {
      booked.add(r.tableId);
    }
  }
  return booked;
}

export async function getAvailableTables({
  branchId,
  dateIso,
  time,
  guestCount,
}: {
  branchId: string;
  dateIso: string;
  time: string;
  guestCount: number;
}): Promise<AvailableTable[]> {
  const bookedIds = await getBookedTableIds(branchId, dateIso, time);

  const tables = await prisma.table.findMany({
    where: {
      branchId,
      status: TableStatus.AVAILABLE,
      capacity: { gte: guestCount },
      id: { notIn: [...bookedIds] },
    },
    orderBy: [{ floor: "asc" }, { capacity: "asc" }, { tableNumber: "asc" }],
    select: {
      id: true,
      tableNumber: true,
      capacity: true,
      floor: true,
    },
  });

  return tables;
}

export async function isTableAvailable(
  tableId: string,
  branchId: string,
  dateIso: string,
  time: string,
  guestCount: number,
): Promise<boolean> {
  const table = await prisma.table.findFirst({
    where: {
      id: tableId,
      branchId,
      capacity: { gte: guestCount },
      status: { not: TableStatus.MAINTENANCE },
    },
  });
  if (!table) return false;

  const bookedIds = await getBookedTableIds(branchId, dateIso, time);
  return !bookedIds.has(tableId);
}
