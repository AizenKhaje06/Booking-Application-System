"use server";

import { EventBookingStatus, PaymentStatus, ReservationStatus, UserRole } from "@prisma/client";
import { subMonths, startOfDay, startOfMonth, format } from "date-fns";

import { getAdminScope, reservationBranchFilter, venueBranchFilter } from "@/lib/admin/scope";
import { prisma } from "@/lib/prisma";
import { toActionError } from "@/utils/errors";

function buildPaymentWhere(branchId: string | null, status: PaymentStatus) {
  if (!branchId) {
    return { paymentStatus: status };
  }
  return {
    paymentStatus: status,
    OR: [{ reservation: { branchId } }, { eventBooking: { venue: { branchId } } }],
  };
}

export async function getDashboardOverview() {
  try {
    const scope = await getAdminScope();
    const branchWhere = reservationBranchFilter(scope);
    const today = startOfDay(new Date());
    const monthStart = startOfMonth(new Date());

    const [
      totalReservations,
      pendingReservations,
      todayReservations,
      totalEventBookings,
      pendingEvents,
      totalBranches,
      totalUsers,
      staffCount,
      paidPayments,
      monthPayments,
    ] = await Promise.all([
      prisma.reservation.count({ where: branchWhere }),
      prisma.reservation.count({
        where: { ...branchWhere, status: ReservationStatus.PENDING },
      }),
      prisma.reservation.count({
        where: {
          ...branchWhere,
          reservationDate: { gte: today },
          status: { in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
        },
      }),
      prisma.eventBooking.count({ where: venueBranchFilter(scope) }),
      prisma.eventBooking.count({
        where: { ...venueBranchFilter(scope), status: EventBookingStatus.PENDING },
      }),
      scope.isSuperAdmin ? prisma.branch.count() : scope.branchId ? 1 : 0,
      scope.isSuperAdmin
        ? prisma.user.count({ where: { role: { not: UserRole.CUSTOMER } } })
        : prisma.user.count({
            where: {
              branchId: scope.branchId ?? undefined,
              role: { in: [UserRole.STAFF, UserRole.BRANCH_ADMIN] },
            },
          }),
      prisma.user.count({
        where: {
          role: UserRole.STAFF,
          ...(scope.branchId ? { branchId: scope.branchId } : {}),
        },
      }),
      prisma.payment.aggregate({
        where: buildPaymentWhere(scope.branchId, PaymentStatus.PAID),
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          ...buildPaymentWhere(scope.branchId, PaymentStatus.PAID),
          createdAt: { gte: monthStart },
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      success: true as const,
      data: {
        totalReservations,
        pendingReservations,
        todayReservations,
        totalEventBookings,
        pendingEvents,
        totalBranches,
        totalUsers,
        staffCount,
        totalRevenue: Number(paidPayments._sum.amount ?? 0),
        monthRevenue: Number(monthPayments._sum.amount ?? 0),
      },
    };
  } catch (error) {
    return toActionError(error);
  }
}

export async function getRevenueChartData() {
  try {
    const scope = await getAdminScope();
    const branchId = scope.branchId;
    const months: { month: string; revenue: number; reservations: number; events: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const start = startOfMonth(subMonths(new Date(), i));
      const end = startOfMonth(subMonths(new Date(), i - 1));

      const payments = await prisma.payment.findMany({
        where: {
          paymentStatus: PaymentStatus.PAID,
          createdAt: { gte: start, lt: end },
          OR: [
            branchId ? { reservation: { branchId } } : { reservationId: { not: null } },
            branchId
              ? { eventBooking: { venue: { branchId } } }
              : { eventBookingId: { not: null } },
          ],
        },
        select: { amount: true, bookingType: true },
      });

      const revenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const reservations = payments.filter((p) => p.bookingType === "RESERVATION").length;
      const events = payments.filter((p) => p.bookingType === "EVENT_BOOKING").length;

      months.push({
        month: format(start, "MMM yyyy"),
        revenue,
        reservations,
        events,
      });
    }

    return { success: true as const, data: months };
  } catch (error) {
    return toActionError(error);
  }
}

export async function getReservationStatusBreakdown() {
  try {
    const scope = await getAdminScope();
    const branchWhere = reservationBranchFilter(scope);

    const statuses = await prisma.reservation.groupBy({
      by: ["status"],
      where: branchWhere,
      _count: { id: true },
    });

    return {
      success: true as const,
      data: statuses.map((s) => ({
        name: s.status,
        value: s._count.id,
      })),
    };
  } catch (error) {
    return toActionError(error);
  }
}

export async function getActivityLog(limit = 15) {
  try {
    const scope = await getAdminScope();
    const branchWhere = reservationBranchFilter(scope);

    const [reservations, events, notifications] = await Promise.all([
      prisma.reservation.findMany({
        where: branchWhere,
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          customer: { select: { name: true } },
          branch: { select: { name: true } },
        },
      }),
      prisma.eventBooking.findMany({
        where: venueBranchFilter(scope),
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          customer: { select: { name: true } },
          venue: { select: { name: true } },
        },
      }),
      prisma.notification.findMany({
        where: { userId: scope.userId },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
    ]);

    type ActivityItem = {
      id: string;
      type: "reservation" | "event" | "notification";
      title: string;
      description: string;
      createdAt: Date;
    };

    const items: ActivityItem[] = [
      ...reservations.map((r) => ({
        id: `res-${r.id}`,
        type: "reservation" as const,
        title: `Reservation ${r.status.toLowerCase()}`,
        description: `${r.customer.name} · ${r.branch.name} · ${r.guestCount} guests`,
        createdAt: r.createdAt,
      })),
      ...events.map((e) => ({
        id: `evt-${e.id}`,
        type: "event" as const,
        title: `Event booking ${e.status.toLowerCase()}`,
        description: `${e.customer.name} · ${e.venue.name}`,
        createdAt: e.createdAt,
      })),
      ...notifications.map((n) => ({
        id: `notif-${n.id}`,
        type: "notification" as const,
        title: n.title,
        description: n.message.slice(0, 80),
        createdAt: n.createdAt,
      })),
    ];

    items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return { success: true as const, data: items.slice(0, limit) };
  } catch (error) {
    return toActionError(error);
  }
}

export async function getCalendarBookings(year: number, month: number) {
  try {
    const scope = await getAdminScope();
    const branchWhere = reservationBranchFilter(scope);
    const venueWhere = venueBranchFilter(scope);

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const [reservations, events] = await Promise.all([
      prisma.reservation.findMany({
        where: {
          ...branchWhere,
          reservationDate: { gte: start, lte: end },
          status: { not: ReservationStatus.CANCELLED },
        },
        select: {
          id: true,
          reservationDate: true,
          reservationTime: true,
          guestCount: true,
          status: true,
          branch: { select: { name: true } },
        },
      }),
      prisma.eventBooking.findMany({
        where: {
          ...venueWhere,
          eventDate: { gte: start, lte: end },
          status: { notIn: [EventBookingStatus.CANCELLED, EventBookingStatus.REJECTED] },
        },
        select: {
          id: true,
          eventDate: true,
          startTime: true,
          eventType: true,
          status: true,
          venue: { select: { name: true } },
        },
      }),
    ]);

    return {
      success: true as const,
      data: {
        reservations: reservations.map((r) => ({
          id: r.id,
          date: r.reservationDate,
          time: r.reservationTime,
          label: `${r.branch.name} · ${r.guestCount}p`,
          status: r.status,
          kind: "reservation" as const,
        })),
        events: events.map((e) => ({
          id: e.id,
          date: e.eventDate,
          time: e.startTime,
          label: e.venue.name,
          status: e.status,
          kind: "event" as const,
        })),
      },
    };
  } catch (error) {
    return toActionError(error);
  }
}

export async function getRecentReservations(limit = 8) {
  try {
    const scope = await getAdminScope();

    const reservations = await prisma.reservation.findMany({
      where: reservationBranchFilter(scope),
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        customer: { select: { name: true, email: true } },
        branch: { select: { name: true } },
        table: { select: { tableNumber: true } },
      },
    });

    return { success: true as const, data: reservations };
  } catch (error) {
    return toActionError(error);
  }
}
