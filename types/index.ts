export type {
  UserRole,
  TableStatus,
  ReservationStatus,
  EventBookingStatus,
  EventType,
  BookingType,
  PaymentMethod,
  PaymentStatus,
} from "@prisma/client";

export type { OpeningHours, DayHours } from "@/types/database";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface BranchCardData {
  id: string;
  slug: string;
  name: string;
  address: string;
  image: string | null;
  isMainBranch: boolean;
}
