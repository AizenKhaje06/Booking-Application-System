import { Calendar } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { BookingEmptyState } from "@/components/booking/empty-state";
import { ReservationCard } from "@/components/reservations/reservation-card";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { getCustomerReservations } from "@/actions/reservations/get-reservations";
import { getCurrentUser } from "@/lib/session";

export const metadata = {
  title: "My Reservations",
};

export default async function AccountReservationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in?callbackUrl=/account/reservations");

  const result = await getCustomerReservations();
  const reservations = result.success ? result.data : [];

  const upcoming = reservations.filter((r) => r.status === "CONFIRMED" || r.status === "PENDING");
  const past = reservations.filter(
    (r) => r.status === "COMPLETED" || r.status === "CANCELLED" || r.status === "NO_SHOW",
  );

  return (
    <>
      <PageHeader
        title="My Reservations"
        description="Track upcoming bookings and view your history"
      >
        <Button asChild>
          <Link href="/reservations">Book a table</Link>
        </Button>
      </PageHeader>

      <div className="container space-y-12 pb-16">
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Calendar className="text-primary h-5 w-5" />
            Upcoming
          </h2>
          {upcoming.length === 0 ? (
            <BookingEmptyState
              title="No upcoming reservations"
              description="Book your next dining experience at any of our branches."
              actionLabel="Make a reservation"
              actionHref="/reservations"
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {upcoming.map((r) => (
                <ReservationCard key={r.id} reservation={r} />
              ))}
            </div>
          )}
        </section>

        {past.length > 0 && (
          <section>
            <h2 className="text-muted-foreground mb-4 text-lg font-semibold">Past bookings</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {past.map((r) => (
                <ReservationCard key={r.id} reservation={r} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
