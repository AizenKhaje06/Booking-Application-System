"use client";

import { format } from "date-fns";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CalendarItem {
  id: string;
  date: Date;
  time: string;
  label: string;
  status: string;
  kind: "reservation" | "event";
}

interface CalendarDashboardProps {
  reservations: CalendarItem[];
  events: CalendarItem[];
}

export function CalendarDashboard({ reservations, events }: CalendarDashboardProps) {
  const [selected, setSelected] = useState<Date | undefined>(new Date());

  const allItems = useMemo(() => [...reservations, ...events], [reservations, events]);

  const datesWithBookings = useMemo(() => {
    const dates = new Set<string>();
    allItems.forEach((item) => {
      dates.add(format(new Date(item.date), "yyyy-MM-dd"));
    });
    return dates;
  }, [allItems]);

  const dayItems = useMemo(() => {
    if (!selected) return [];
    const key = format(selected, "yyyy-MM-dd");
    return allItems.filter((item) => format(new Date(item.date), "yyyy-MM-dd") === key);
  }, [allItems, selected]);

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Calendar</CardTitle>
        <p className="text-muted-foreground text-sm">Reservations & events by date</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 lg:flex-row">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={setSelected}
          className="rounded-lg border"
          modifiers={{
            booked: (date) => datesWithBookings.has(format(date, "yyyy-MM-dd")),
          }}
          modifiersClassNames={{
            booked: "bg-primary/15 font-semibold text-primary",
          }}
        />
        <div className="min-w-0 flex-1">
          <p className="mb-3 text-sm font-medium">
            {selected ? format(selected, "EEEE, MMM d") : "Select a date"}
          </p>
          {dayItems.length === 0 ? (
            <p className="text-muted-foreground text-sm">No bookings on this day</p>
          ) : (
            <ul className="space-y-2">
              {dayItems.map((item) => (
                <li
                  key={item.id}
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-3 py-2 text-sm",
                    item.kind === "event" ? "border-violet-500/20 bg-violet-500/5" : "",
                  )}
                >
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-muted-foreground text-xs">{item.time}</p>
                  </div>
                  <Badge variant={item.kind === "event" ? "secondary" : "outline"}>
                    {item.kind === "event" ? "Event" : item.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
