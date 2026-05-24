import { Suspense } from "react";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";

import { EventBookingForm } from "@/components/events/event-booking-form";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { PageHeader } from "@/components/shared/page-header";
import { getCurrentUser } from "@/lib/session";
import { getVenueBySlug } from "@/services/events/availability";

export const metadata = {
  title: "Book Event Venue",
};

export default async function EventBookPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    const { slug } = await params;
    redirect(`/auth/sign-in?callbackUrl=/events/${slug}/book`);
  }

  const { slug } = await params;
  const venue = await getVenueBySlug(slug);
  if (!venue) notFound();

  return (
    <div className="event-luxury-theme">
      <PageHeader
        title="Event inquiry"
        description={`Plan your celebration at ${venue.name} — Main Branch, Floor ${venue.floor}`}
      />
      <div className="container pb-16">
        <Suspense
          fallback={
            <div className="flex justify-center py-20">
              <LoadingSpinner className="h-10 w-10" />
            </div>
          }
        >
          <EventBookingForm
            venue={{
              id: venue.id,
              slug: venue.slug,
              name: venue.name,
              capacity: venue.capacity,
              floor: venue.floor,
            }}
            packages={venue.packages}
          />
        </Suspense>
      </div>
    </div>
  );
}
