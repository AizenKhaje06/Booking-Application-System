/** Default dining duration per reservation (minutes) */
export const RESERVATION_DURATION_MINUTES = 120;

/** Time slot interval for booking picker (minutes) */
export const SLOT_INTERVAL_MINUTES = 30;

/** How far ahead customers can book (days) */
export const MAX_BOOKING_DAYS_AHEAD = 60;

/** Statuses that block a table from being booked */
export const BLOCKING_RESERVATION_STATUSES = ["PENDING", "CONFIRMED"] as const;
