import { z } from "zod";

export const emailSchema = z.string().email("Please enter a valid email address");

export const phoneSchema = z
  .string()
  .min(10, "Phone number is too short")
  .max(20, "Phone number is too long")
  .optional();

export const partySizeSchema = z.coerce.number().int().min(1).max(20);
