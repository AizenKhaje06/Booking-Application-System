"use client";

import { Building2, Calendar, Clock, Users, Utensils } from "lucide-react";

import { formatDate, formatTimeDisplay } from "@/lib/booking/display";
import { cn } from "@/lib/utils";

interface ReservationSummaryProps {
  branchName: string;
  reservationDate: string;
  reservationTime: string;
  guestCount: number;
  tableNumber?: string | null;
  tableCapacity?: number | null;
  notes?: string;
  className?: string;
}

export function ReservationSummary({
  branchName,
  reservationDate,
  reservationTime,
  guestCount,
  tableNumber,
  tableCapacity,
  notes,
  className,
}: ReservationSummaryProps) {
  const items = [
    { icon: Building2, label: "Branch", value: branchName },
    {
      icon: Calendar,
      label: "Date",
      value: formatDate(new Date(reservationDate + "T12:00:00")),
    },
    { icon: Clock, label: "Time", value: formatTimeDisplay(reservationTime) },
    { icon: Users, label: "Guests", value: String(guestCount) },
    ...(tableNumber
      ? [
          {
            icon: Utensils,
            label: "Table",
            value: `Table ${tableNumber}${tableCapacity ? ` (seats ${tableCapacity})` : ""}`,
          },
        ]
      : []),
  ];

  return (
    <div className={cn("bg-muted/30 rounded-xl border p-4", className)}>
      <h3 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
        Reservation summary
      </h3>
      <ul className="space-y-3">
        {items.map(({ icon: Icon, label, value }) => (
          <li key={label} className="flex items-start gap-3 text-sm">
            <Icon className="text-primary mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <span className="text-muted-foreground">{label}</span>
              <p className="font-medium">{value}</p>
            </div>
          </li>
        ))}
        {notes && (
          <li className="border-t pt-3 text-sm">
            <span className="text-muted-foreground">Special requests</span>
            <p className="font-medium">{notes}</p>
          </li>
        )}
      </ul>
    </div>
  );
}
