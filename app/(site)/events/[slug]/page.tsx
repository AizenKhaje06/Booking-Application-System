import { Building2, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EventCalendar } from "@/components/events/event-calendar";
import { GallerySlider } from "@/components/events/gallery-slider";
import { PackageCards } from "@/components/events/package-cards";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/events/constants";
import { getVenueBySlug } from "@/services/events/availability";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const venue = await getVenueBySlug(slug);
  return {
    title: venue?.name ?? "Event Venue",
    description: venue?.description?.slice(0, 160),
  };
}

export default async function VenueDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const venue = await getVenueBySlug(slug);
  if (!venue) notFound();

  const gallery = venue.gallery.length > 0 ? venue.gallery : venue.image ? [venue.image] : [];

  return (
    <div className="event-luxury-theme">
      <PageHeader
        title={venue.name}
        description={venue.tagline ?? `Main Branch · Floor ${venue.floor}`}
        className="border-b bg-gradient-to-b from-amber-500/5 to-transparent"
      >
        <Button asChild className="bg-gradient-to-r from-amber-700 to-amber-600">
          <Link href={`/events/${venue.slug}/book`}>Book this venue</Link>
        </Button>
      </PageHeader>

      <div className="container space-y-16 pb-16">
        <GallerySlider images={gallery} alt={venue.name} />

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div>
              <h2 className="font-serif text-2xl font-bold">About the venue</h2>
              <p className="text-muted-foreground mt-4 leading-relaxed">{venue.description}</p>
            </div>
            <div>
              <h3 className="mb-4 font-serif text-xl font-semibold">Amenities</h3>
              <ul className="grid gap-3 sm:grid-cols-2">
                {venue.amenities.map((a) => (
                  <li
                    key={a}
                    className="flex items-center gap-2 rounded-lg border border-amber-500/15 px-4 py-3 text-sm"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-serif text-xl font-semibold">Event types we host</h3>
              <div className="flex flex-wrap gap-2">
                {["Wedding", "Birthday", "Christening", "Corporate", "Seminar", "Anniversary"].map(
                  (t) => (
                    <span
                      key={t}
                      className="rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm"
                    >
                      {t}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-amber-500/20 p-6 shadow-sm">
              <p className="text-muted-foreground text-sm">Starting from</p>
              <p className="font-serif text-3xl text-amber-600">
                {formatPrice(Number(venue.price))}
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-amber-600" />
                  Up to {venue.capacity} guests
                </li>
                <li className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-amber-600" />
                  Floor {venue.floor} · {venue.branch.name}
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-amber-600" />
                  {venue.branch.address}
                </li>
              </ul>
              <Button className="mt-6 w-full" asChild>
                <Link href={`/events/${venue.slug}/book`}>Check availability</Link>
              </Button>
            </div>
            <EventCalendar venueId={venue.id} />
          </div>
        </div>

        <section>
          <h2 className="mb-8 font-serif text-2xl font-bold">Packages & pricing</h2>
          <PackageCards packages={venue.packages} venueSlug={venue.slug} />
        </section>
      </div>
    </div>
  );
}
