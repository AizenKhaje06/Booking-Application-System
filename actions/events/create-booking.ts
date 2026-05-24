"use server";

import { BookingType, EventBookingStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { startOfDay } from "date-fns";
import { revalidatePath } from "next/cache";

import { calculateDeposit } from "@/lib/events/constants";
import { prisma } from "@/lib/prisma";
import { createEventBookingSchema } from "@/lib/validations/event-booking";
import { getCurrentUser } from "@/lib/session";
import { isVenueAvailable } from "@/services/events/availability";
import { notifyStatusUpdate } from "@/services/notifications";
import { toActionError } from "@/utils/errors";

export async function createEventBooking(data: unknown) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false as const, error: "Please sign in to submit an event inquiry" };
    }

    const parsed = createEventBookingSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false as const,
        error: parsed.error.issues[0]?.message ?? "Invalid booking data",
      };
    }

    const input = parsed.data;

    const pkg = await prisma.eventPackage.findFirst({
      where: { id: input.packageId, venueId: input.venueId },
      include: { venue: { include: { branch: true } } },
    });

    if (!pkg) {
      return { success: false as const, error: "Selected package not found" };
    }

    if (pkg.maxGuests && input.guestCount > pkg.maxGuests) {
      return {
        success: false as const,
        error: `This package supports up to ${pkg.maxGuests} guests`,
      };
    }

    const available = await isVenueAvailable(
      input.venueId,
      input.eventDate,
      input.startTime,
      input.endTime,
    );

    if (!available) {
      return {
        success: false as const,
        error: "This date and time is no longer available. Please choose another slot.",
      };
    }

    const totalPrice = Number(pkg.price);
    const depositAmount = calculateDeposit(totalPrice);

    const booking = await prisma.$transaction(async (tx) => {
      const stillAvailable = await isVenueAvailable(
        input.venueId,
        input.eventDate,
        input.startTime,
        input.endTime,
      );
      if (!stillAvailable) throw new Error("SLOT_TAKEN");

      const created = await tx.eventBooking.create({
        data: {
          customerId: user.id,
          venueId: input.venueId,
          packageId: pkg.id,
          eventType: input.eventType,
          guestCount: input.guestCount,
          eventDate: startOfDay(new Date(input.eventDate)),
          startTime: input.startTime,
          endTime: input.endTime,
          status: EventBookingStatus.PENDING,
          packageName: pkg.name,
          totalPrice: pkg.price,
          depositAmount,
          contactPhone: input.contactPhone,
          notes: input.notes ?? null,
        },
        include: {
          venue: true,
          package: true,
        },
      });

      await tx.payment.create({
        data: {
          bookingType: BookingType.EVENT_BOOKING,
          bookingId: created.id,
          eventBookingId: created.id,
          amount: depositAmount,
          paymentMethod: PaymentMethod.PAYMONGO,
          paymentStatus: PaymentStatus.PENDING,
        },
      });

      return created;
    });

    const payment = await prisma.payment.findFirst({
      where: { eventBookingId: booking.id },
      orderBy: { createdAt: "desc" },
    });

    await notifyStatusUpdate({
      userId: user.id,
      title: "Complete your event deposit",
      message: `Pay your ₱${depositAmount} downpayment to submit your ${pkg.name} inquiry for ${booking.venue.name}.`,
    });

    revalidatePath("/admin/events");
    revalidatePath("/account/events");

    return {
      success: true as const,
      data: {
        id: booking.id,
        paymentId: payment?.id ?? "",
        depositAmount,
        totalPrice,
      },
    };
  } catch (error) {
    if (error instanceof Error && error.message === "SLOT_TAKEN") {
      return {
        success: false as const,
        error: "This slot was just booked. Please choose another time.",
      };
    }
    return toActionError(error);
  }
}

export async function checkEventAvailability(params: {
  venueId: string;
  eventDate: string;
  startTime: string;
  endTime: string;
}) {
  try {
    const available = await isVenueAvailable(
      params.venueId,
      params.eventDate,
      params.startTime,
      params.endTime,
    );
    return { success: true as const, data: { available } };
  } catch (error) {
    return toActionError(error);
  }
}

export async function getCustomerEventBookings() {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { success: false as const, error: "Unauthorized" };

    const bookings = await prisma.eventBooking.findMany({
      where: { customerId: user.id },
      orderBy: { eventDate: "desc" },
      include: {
        venue: { select: { name: true, slug: true, image: true } },
        package: { select: { name: true } },
      },
    });

    return { success: true as const, data: bookings };
  } catch (error) {
    return toActionError(error);
  }
}
