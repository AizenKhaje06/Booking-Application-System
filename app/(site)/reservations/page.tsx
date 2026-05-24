import { redirect } from "next/navigation";

import { BookingWizard } from "@/components/booking/booking-wizard";
import { PageHeader } from "@/components/shared/page-header";
import { getCurrentUser } from "@/lib/session";

export const metadata = {
  title: "Book a Table",
};

export default async function ReservationsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/sign-in?callbackUrl=/reservations");
  }

  return (
    <>
      <PageHeader
        title="Book a Table"
        description="Select your branch, date, and time — we'll show available tables in real time."
      />
      <div className="container pb-16">
        <BookingWizard />
      </div>
    </>
  );
}
