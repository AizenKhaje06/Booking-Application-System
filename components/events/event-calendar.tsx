"use client";

import { format } from "date-fns";
import { useCallback, useEffect, useState, useTransition } from "react";

import { fetchVenueCalendar } from "@/actions/events/get-calendar";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { isDateBookable } from "@/lib/booking/time-slots";
import { cn } from "@/lib/utils";

interface EventCalendarProps {
  venueId: string;
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  className?: string;
}

export function EventCalendar({ venueId, selected, onSelect, className }: EventCalendarProps) {
  const [month, setMonth] = useState(() => new Date());
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const loadMonth = useCallback(
    (date: Date) => {
      startTransition(async () => {
        const res = await fetchVenueCalendar(venueId, date.getFullYear(), date.getMonth() + 1);
        if (res.success) {
          setBookedDates(new Set(res.data.bookedDates));
        }
      });
    },
    [venueId],
  );

  useEffect(() => {
    loadMonth(month);
  }, [month, loadMonth]);

  const isBooked = (date: Date) => bookedDates.has(format(date, "yyyy-MM-dd"));

  return (
    <Card className={cn("border-amber-500/20", className)}>
      <CardHeader>
        <CardTitle className="font-serif">Event calendar</CardTitle>
        <CardDescription>
          Dates marked are fully booked. Select an available date for your celebration.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isPending && <Skeleton className="mb-4 h-4 w-32" />}
        <Calendar
          mode="single"
          selected={selected}
          onSelect={onSelect}
          month={month}
          onMonthChange={(d) => {
            setMonth(d);
            loadMonth(d);
          }}
          disabled={(date) => !isDateBookable(date) || isBooked(date)}
          modifiers={{ booked: (date) => isBooked(date) }}
          modifiersClassNames={{
            booked: "bg-destructive/15 text-destructive line-through opacity-60",
          }}
          className="mx-auto rounded-md border"
        />
        <div className="text-muted-foreground mt-4 flex flex-wrap gap-4 text-xs">
          <span className="flex items-center gap-2">
            <span className="bg-destructive/20 h-3 w-3 rounded" /> Fully booked
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded border" /> Available
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
