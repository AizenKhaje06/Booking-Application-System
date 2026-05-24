import Link from "next/link";
import { redirect } from "next/navigation";

import { getCustomerEventBookings } from "@/actions/events/create-booking";
import { BookingEmptyState } from "@/components/booking/empty-state";
import { EventBookingStatusBadge } from "@/components/events/event-booking-status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EVENT_TYPE_LABELS, formatPrice } from "@/lib/events/constants";
import { formatDate, formatTimeDisplay } from "@/lib/booking/display";
import { getCurrentUser } from "@/lib/session";

export const metadata = {
  title: "My Events",
};

export default async function AccountEventsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in?callbackUrl=/account/events");

  const result = await getCustomerEventBookings();
  const bookings = result.success ? result.data : [];

  return (
    <>
      <PageHeader title="My event bookings" description="Track venue inquiries and confirmations">
        <Button asChild className="bg-gradient-to-r from-amber-700 to-amber-600">
          <Link href="/events">Plan an event</Link>
        </Button>
      </PageHeader>

      <div className="container pb-16">
        {bookings.length === 0 ? (
          <BookingEmptyState
            title="No event bookings yet"
            description="Host your next celebration at Skyline Event Hall on our Main Branch 2nd floor."
            actionLabel="Explore venue"
            actionHref="/events"
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {bookings.map((b) => (
              <Card key={b.id} className="overflow-hidden border-amber-500/15">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="font-serif text-lg">{b.venue.name}</CardTitle>
                    <p className="text-muted-foreground text-sm">
                      {EVENT_TYPE_LABELS[b.eventType]}
                    </p>
                  </div>
                  <EventBookingStatusBadge status={b.status} />
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    {formatDate(b.eventDate)} · {formatTimeDisplay(b.startTime)} –{" "}
                    {formatTimeDisplay(b.endTime)}
                  </p>
                  <p>
                    {b.guestCount} guests · {b.package?.name ?? b.packageName}
                  </p>
                  <p className="font-medium text-amber-700 dark:text-amber-400">
                    {formatPrice(Number(b.totalPrice))}
                  </p>
                  <Link
                    href={`/events/inquiry/success?id=${b.id}`}
                    className="text-primary inline-block pt-2 hover:underline"
                  >
                    View details →
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
