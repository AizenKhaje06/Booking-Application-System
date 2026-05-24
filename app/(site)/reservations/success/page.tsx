import { format } from "date-fns";
import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";
import { ReservationStatus } from "@prisma/client";
import { notFound, redirect } from "next/navigation";

import { ReservationSummary } from "@/components/booking/reservation-summary";
import { ReservationStatusBadge } from "@/components/reservations/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getReservationById } from "@/actions/reservations/get-reservations";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export const metadata = {
  title: "Reservation Confirmed",
};

export default async function ReservationSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in?callbackUrl=/reservations");

  const { id } = await searchParams;
  if (!id) notFound();

  const result = await getReservationById(id);
  if (!result.success || !result.data) notFound();

  const reservation = result.data;

  const pendingPayment =
    reservation.status === ReservationStatus.PENDING
      ? await prisma.payment.findFirst({
          where: { reservationId: reservation.id, paymentStatus: "PENDING" },
          orderBy: { createdAt: "desc" },
        })
      : null;

  return (
    <div className="container max-w-2xl py-12 md:py-16">
      <div className="mb-8 text-center">
        <div
          className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${pendingPayment ? "bg-amber-500/15" : "bg-emerald-500/15"}`}
        >
          {pendingPayment ? (
            <Clock className="h-10 w-10 text-amber-600" />
          ) : (
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          )}
        </div>
        <h1 className="text-3xl font-bold">
          {pendingPayment ? "Awaiting deposit" : "Reservation confirmed!"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {pendingPayment
            ? "Complete your deposit to confirm this reservation."
            : `A confirmation email was sent to ${user.email}`}
        </p>
        <div className="mt-4 flex justify-center">
          <ReservationStatusBadge status={reservation.status} />
        </div>
      </div>

      <ReservationSummary
        branchName={reservation.branch.name}
        reservationDate={format(reservation.reservationDate, "yyyy-MM-dd")}
        reservationTime={reservation.reservationTime}
        guestCount={reservation.guestCount}
        tableNumber={reservation.table?.tableNumber}
        tableCapacity={reservation.table?.capacity}
        notes={reservation.notes ?? undefined}
        className="mb-6"
      />

      <Card>
        <CardContent className="text-muted-foreground py-4 text-center text-sm">
          Confirmation ID: <span className="text-foreground font-mono">{reservation.id}</span>
        </CardContent>
      </Card>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {pendingPayment && (
          <Button asChild>
            <Link href={`/payments/checkout?paymentId=${pendingPayment.id}`}>Pay deposit</Link>
          </Button>
        )}
        <Button variant={pendingPayment ? "outline" : "default"} asChild>
          <Link href="/account/reservations">View booking history</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/reservations">Book another table</Link>
        </Button>
      </div>
    </div>
  );
}
