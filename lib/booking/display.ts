import { format, parseISO } from "date-fns";

import { formatTimeDisplay } from "@/lib/booking/time-slots";

export function formatDate(date: Date | string, pattern = "EEEE, MMMM d, yyyy") {
  const value = typeof date === "string" ? parseISO(date) : date;
  return format(value, pattern);
}

export { formatTimeDisplay };
