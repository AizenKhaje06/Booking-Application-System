export const RESERVATION_DEPOSIT_PER_GUEST = 100;
export const RESERVATION_DEPOSIT_MINIMUM = 300;

export const PAYMONGO_PAYMENT_METHODS = ["card", "gcash", "paymaya"] as const;

export type PayMongoCheckoutMethod = (typeof PAYMONGO_PAYMENT_METHODS)[number];

export function calculateReservationDeposit(guestCount: number): number {
  return Math.max(RESERVATION_DEPOSIT_MINIMUM, guestCount * RESERVATION_DEPOSIT_PER_GUEST);
}

/** Convert PHP amount to PayMongo centavos (integer). */
export function phpToCentavos(amount: number): number {
  return Math.round(amount * 100);
}

/** Convert PayMongo centavos to PHP. */
export function centavosToPhp(centavos: number): number {
  return centavos / 100;
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CARD: "Credit / Debit Card",
  GCASH: "GCash",
  PAYMAYA: "Maya",
  PAYMONGO: "PayMongo",
  CASH: "Cash",
  BANK_TRANSFER: "Bank Transfer",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
  CANCELLED: "Cancelled",
};
