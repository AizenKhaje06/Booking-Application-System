import { z } from "zod";

import { partySizeSchema } from "@/lib/validations/common";

export const bookingCustomerSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Valid email is required"),
  phone: z
    .string()
    .min(10, "Phone number is too short")
    .max(20, "Phone number is too long")
    .optional()
    .or(z.literal("")),
  notes: z.string().max(500, "Notes are too long").optional(),
});

export const createReservationSchema = z.object({
  branchId: z.string().min(1, "Select a branch"),
  tableId: z.string().min(1, "Select a table"),
  reservationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  reservationTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time"),
  guestCount: partySizeSchema,
  notes: z.string().max(500).optional(),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type BookingCustomerInput = z.infer<typeof bookingCustomerSchema>;
