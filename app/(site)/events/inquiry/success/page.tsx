import { Sparkles } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { EventBookingStatusBadge } from "@/components/events/event-booking-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { EVENT_TYPE_LABELS, formatPrice } from "@/lib/events/constants";
import { formatDate, formatTimeDisplay } from "@/lib/booking/display";
import { getCurrentUser } from "@/lib/session";

export const metadata = {
  title: "Inquiry Submitted",
};

export default async function EventInquirySuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");

  const { id } = await searchParams;
  if (!id) notFound();

  const booking = await prisma.eventBooking.findFirst({
    where: { id, customerId: user.id },
    include: { venue: true, package: true },
  });

  if (!booking) notFound();

  return (
    <div className="event-luxury-theme container max-w-2xl py-16 md:py-24">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15">
          <Sparkles className="h-8 w-8 text-amber-600" />
        </div>
        <h1 className="font-serif text-3xl font-bold">Inquiry submitted</h1>
        <p className="text-muted-foreground mt-2">
          Our events team will review your request within 24–48 hours.
        </p>
        <div className="mt-4 flex justify-center">
          <EventBookingStatusBadge status={booking.status} />
        </div>
      </div>

      <Card className="mt-10 border-amber-500/20">
        <CardContent className="space-y-3 pt-6 text-sm">
          <p>
            <strong>Venue:</strong> {booking.venue.name}
          </p>
          <p>
            <strong>Event:</strong> {EVENT_TYPE_LABELS[booking.eventType]}
          </p>
          <p>
            <strong>Date:</strong> {formatDate(booking.eventDate)} ·{" "}
            {formatTimeDisplay(booking.startTime)} – {formatTimeDisplay(booking.endTime)}
          </p>
          <p>
            <strong>Package:</strong> {booking.packageName ?? booking.package?.name}
          </p>
          <p>
            <strong>Total:</strong> {formatPrice(Number(booking.totalPrice))}
          </p>
          <p>
            <strong>Deposit on approval:</strong> {formatPrice(Number(booking.depositAmount ?? 0))}
          </p>
          <p className="text-muted-foreground font-mono text-xs">Ref: {booking.id}</p>
        </CardContent>
      </Card>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href="/account/events">View my events</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/events">Back to venue</Link>
        </Button>
      </div>
    </div>
  );
}
