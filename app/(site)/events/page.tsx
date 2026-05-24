import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GallerySlider } from "@/components/events/gallery-slider";
import { PackageCards } from "@/components/events/package-cards";
import { Button } from "@/components/ui/button";
import { VENUE_SLUG } from "@/lib/events/constants";
import { getVenueBySlug } from "@/services/events/availability";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Event Venue",
  description: "Skyline Event Hall — luxury celebrations on the Main Branch 2nd floor",
};

export default async function EventsLandingPage() {
  const venue = await getVenueBySlug(VENUE_SLUG);
  if (!venue) notFound();

  const gallery = venue.gallery.length > 0 ? venue.gallery : venue.image ? [venue.image] : [];

  return (
    <div className="event-luxury-theme">
      <section className="relative overflow-hidden">
        <GallerySlider images={gallery} alt={venue.name} className="rounded-none" />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-black/30 to-transparent">
          <div className="container pt-32 pb-12 md:pb-16">
            <p className="mb-2 flex items-center gap-2 text-sm font-medium tracking-[0.2em] text-amber-300 uppercase">
              <Sparkles className="h-4 w-4" />
              Main Branch · 2nd Floor
            </p>
            <h1 className="font-serif text-4xl font-bold text-white md:text-6xl">{venue.name}</h1>
            <p className="mt-4 max-w-xl text-lg text-white/85">{venue.tagline}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400"
              >
                <Link href={`/events/${venue.slug}`}>
                  Explore venue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20"
              >
                <Link href={`/events/${venue.slug}/book`}>Request a proposal</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-16 md:py-24">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-bold md:text-4xl">Unforgettable celebrations</h2>
          <p className="text-muted-foreground mt-4">
            From intimate christenings to grand weddings and corporate galas — our events team
            crafts every detail at Skyline Event Hall.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {venue.amenities.slice(0, 6).map((amenity) => (
            <div
              key={amenity}
              className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent p-6 text-center"
            >
              <p className="font-medium">{amenity}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-muted/20 border-t py-16 md:py-24">
        <div className="container">
          <h2 className="mb-10 text-center font-serif text-3xl font-bold">Event packages</h2>
          <PackageCards packages={venue.packages} venueSlug={venue.slug} />
        </div>
      </section>

      <section className="container py-16 text-center">
        <h2 className="font-serif text-2xl font-bold">Ready to plan your event?</h2>
        <p className="text-muted-foreground mx-auto mt-2 max-w-md">
          Submit an inquiry — our team will confirm availability and send a formal proposal.
        </p>
        <Button size="lg" className="mt-6" asChild>
          <Link href={`/events/${venue.slug}/book`}>Start your inquiry</Link>
        </Button>
      </section>
    </div>
  );
}
