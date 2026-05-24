"use server";

import { getBookedDatesForVenue } from "@/services/events/availability";
import { toActionError } from "@/utils/errors";

export async function fetchVenueCalendar(venueId: string, year: number, month: number) {
  try {
    const bookedDates = await getBookedDatesForVenue(venueId, year, month);
    return { success: true as const, data: { bookedDates } };
  } catch (error) {
    return toActionError(error);
  }
}
