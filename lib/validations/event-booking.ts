import { z } from "zod";

import { EventType } from "@prisma/client";

export const createEventBookingSchema = z
  .object({
    venueId: z.string().min(1),
    packageId: z.string().min(1, "Select an event package"),
    eventType: z.nativeEnum(EventType),
    guestCount: z.number().int().min(1, "At least 1 guest").max(150, "Maximum 150 guests"),
    eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
    contactPhone: z.string().min(10).max(20),
    notes: z.string().max(1000).optional(),
  })
  .refine(
    (data) => {
      const [sh, sm] = data.startTime.split(":").map(Number);
      const [eh, em] = data.endTime.split(":").map(Number);
      return eh * 60 + em > sh * 60 + sm;
    },
    { message: "End time must be after start time", path: ["endTime"] },
  );

export type CreateEventBookingInput = z.infer<typeof createEventBookingSchema>;

export const adminReviewSchema = z.object({
  bookingId: z.string().min(1),
  action: z.enum(["approve", "reject"]),
  adminNotes: z.string().max(500).optional(),
});
