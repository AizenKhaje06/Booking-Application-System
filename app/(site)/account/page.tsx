import Link from "next/link";
import { redirect } from "next/navigation";

import { PhoneOtpVerification } from "@/components/auth/phone-otp-verification";
import { getCustomerReservations } from "@/actions/reservations/get-reservations";
import { ReservationCard } from "@/components/reservations/reservation-card";
import { BookingEmptyState } from "@/components/booking/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { getCurrentUser } from "@/lib/session";

export const metadata = {
  title: "My Account",
};

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/sign-in?callbackUrl=/account");
  }

  const reservationsResult = await getCustomerReservations();
  const recent = reservationsResult.success ? reservationsResult.data.slice(0, 2) : [];

  return (
    <>
      <PageHeader title="My Account" description="Your profile and recent bookings">
        <Button asChild>
          <Link href="/reservations">Book a table</Link>
        </Button>
      </PageHeader>

      <div className="container space-y-10 pb-16">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between border-b py-2">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{user.name}</span>
            </div>
            <div className="flex justify-between border-b py-2">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Role</span>
              <span className="font-medium">{user.role ? ROLE_LABELS[user.role] : "Customer"}</span>
            </div>
            <div className="pt-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/account/payments">View transaction history</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <PhoneOtpVerification />

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent reservations</h2>
            <Button variant="link" asChild className="px-0">
              <Link href="/account/reservations">View all →</Link>
            </Button>
          </div>
          {recent.length === 0 ? (
            <BookingEmptyState
              title="No reservations yet"
              description="Book a table at any RestaurantHub branch."
              actionLabel="Book now"
              actionHref="/reservations"
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {recent.map((r) => (
                <ReservationCard key={r.id} reservation={r} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
