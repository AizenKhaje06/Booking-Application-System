import { ReservationStatus } from "@prisma/client";
import { Calendar, Clock, Users } from "lucide-react";
import Link from "next/link";

import { ReservationStatusBadge } from "@/components/reservations/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatTimeDisplay } from "@/lib/booking/display";

export interface ReservationCardData {
  id: string;
  reservationDate: Date;
  reservationTime: string;
  guestCount: number;
  status: ReservationStatus;
  notes: string | null;
  branch: { name: string; slug: string; image: string | null };
  table: { tableNumber: string; floor: number } | null;
}

export function ReservationCard({ reservation }: { reservation: ReservationCardData }) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg">{reservation.branch.name}</CardTitle>
          <p className="text-muted-foreground text-sm">
            Table {reservation.table?.tableNumber ?? "TBD"}
            {reservation.table?.floor ? ` · Floor ${reservation.table.floor}` : ""}
          </p>
        </div>
        <ReservationStatusBadge status={reservation.status} />
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="text-muted-foreground flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {formatDate(reservation.reservationDate)}
        </div>
        <div className="text-muted-foreground flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {formatTimeDisplay(reservation.reservationTime)}
        </div>
        <div className="text-muted-foreground flex items-center gap-2">
          <Users className="h-4 w-4" />
          {reservation.guestCount} guests
        </div>
        {reservation.notes && (
          <p className="text-muted-foreground border-t pt-2">{reservation.notes}</p>
        )}
        <Link
          href={`/reservations/success?id=${reservation.id}`}
          className="text-primary inline-block pt-2 text-sm font-medium hover:underline"
        >
          View details →
        </Link>
      </CardContent>
    </Card>
  );
}
