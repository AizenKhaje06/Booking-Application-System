import { addDays, addMinutes, format, isAfter, isBefore, parse, startOfDay } from "date-fns";

import {
  MAX_BOOKING_DAYS_AHEAD,
  RESERVATION_DURATION_MINUTES,
  SLOT_INTERVAL_MINUTES,
} from "@/lib/booking/constants";
import { type DayHours, type OpeningHours } from "@/types/database";

const DAY_KEYS: (keyof OpeningHours)[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export function getDayKey(date: Date): keyof OpeningHours {
  return DAY_KEYS[date.getDay()];
}

export function parseTimeToMinutes(time: string): number {
  const parsed = parse(time, "HH:mm", new Date());
  return parsed.getHours() * 60 + parsed.getMinutes();
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

export function generateTimeSlots(openingHours: OpeningHours, date: Date): string[] {
  const dayKey = getDayKey(date);
  const dayHours: DayHours = openingHours[dayKey];

  if (dayHours.closed) return [];

  const openMinutes = parseTimeToMinutes(dayHours.open);
  const closeMinutes = parseTimeToMinutes(dayHours.close);
  const lastSlotStart = closeMinutes - RESERVATION_DURATION_MINUTES;

  if (lastSlotStart < openMinutes) return [];

  const slots: string[] = [];
  for (let m = openMinutes; m <= lastSlotStart; m += SLOT_INTERVAL_MINUTES) {
    slots.push(minutesToTime(m));
  }

  return slots;
}

/** Filter out past slots when booking for today */
export function filterPastTimeSlots(slots: string[], date: Date, now = new Date()): string[] {
  const today = startOfDay(now);
  const selected = startOfDay(date);

  if (selected.getTime() > today.getTime()) return slots;
  if (selected.getTime() < today.getTime()) return [];

  return slots.filter((slot) => {
    const slotDate = parse(slot, "HH:mm", date);
    return isAfter(slotDate, addMinutes(now, 30));
  });
}

export function formatTimeDisplay(time: string): string {
  const parsed = parse(time, "HH:mm", new Date());
  return format(parsed, "h:mm a");
}

export function timesOverlap(
  timeA: string,
  timeB: string,
  durationMinutes = RESERVATION_DURATION_MINUTES,
): boolean {
  const startA = parseTimeToMinutes(timeA);
  const endA = startA + durationMinutes;
  const startB = parseTimeToMinutes(timeB);
  const endB = startB + durationMinutes;
  return startA < endB && startB < endA;
}

export function isDateBookable(date: Date, now = new Date()): boolean {
  const today = startOfDay(now);
  const target = startOfDay(date);
  if (isBefore(target, today)) return false;
  const maxDate = addDays(today, MAX_BOOKING_DAYS_AHEAD);
  return !isAfter(target, maxDate);
}
