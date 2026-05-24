import { EventType } from "@prisma/client";

export const VENUE_SLUG = "skyline-event-hall";

export const DEPOSIT_RATE = 0.3;

export const EVENT_TYPES: {
  value: EventType;
  label: string;
  description: string;
}[] = [
  { value: EventType.WEDDING, label: "Wedding", description: "Ceremonies & receptions" },
  { value: EventType.BIRTHDAY, label: "Birthday", description: "Milestone celebrations" },
  {
    value: EventType.CHRISTENING,
    label: "Christening",
    description: "Baptism & family gatherings",
  },
  { value: EventType.CORPORATE, label: "Corporate", description: "Galas & company events" },
  { value: EventType.SEMINAR, label: "Seminar", description: "Workshops & conferences" },
  { value: EventType.ANNIVERSARY, label: "Anniversary", description: "Romantic celebrations" },
];

export const EVENT_TYPE_LABELS: Record<EventType, string> = Object.fromEntries(
  EVENT_TYPES.map((t) => [t.value, t.label]),
) as Record<EventType, string>;

export const EVENT_TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

export function calculateDeposit(totalPrice: number): number {
  return Math.round(totalPrice * DEPOSIT_RATE);
}

export function formatPrice(amount: number | string): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);
}
