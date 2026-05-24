"use client";

import { motion } from "framer-motion";
import { CalendarDays, MapPin, PartyPopper, Sparkles, Utensils } from "lucide-react";
import Link from "next/link";

import { MotionItem, MotionSection } from "@/components/shared/motion-section";
import { RestaurantJsonLd } from "@/components/shared/restaurant-json-ld";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { fadeInUp } from "@/lib/motion";
import { BRANCHES } from "@/lib/constants";

const features = [
  {
    icon: MapPin,
    title: "Three Distinct Branches",
    description:
      "Main, North, and South — each with its own character, menu highlights, and ambiance.",
  },
  {
    icon: CalendarDays,
    title: "Table Reservations",
    description:
      "Book across branches with real-time availability, deposits, and instant confirmation.",
  },
  {
    icon: PartyPopper,
    title: "Event Venue",
    description:
      "Skyline Event Hall on the Main Branch 2nd floor for weddings and corporate events.",
  },
];

export default function HomePage() {
  const reducedMotion = useReducedMotion();

  const heroMotion = reducedMotion
    ? { className: "mx-auto max-w-3xl text-center" }
    : {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
        className: "mx-auto max-w-3xl text-center",
      };

  return (
    <>
      <RestaurantJsonLd />

      <section className="relative overflow-hidden border-b">
        <div className="luxury-gradient absolute inset-0" aria-hidden />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.62_0.11_65/0.12),transparent_60%)]"
          aria-hidden
        />
        <div className="relative container py-20 md:py-32">
          {reducedMotion ? (
            <div {...heroMotion}>
              <HeroContent />
            </div>
          ) : (
            <motion.div {...heroMotion}>
              <HeroContent />
            </motion.div>
          )}
        </div>
      </section>

      <MotionSection className="container py-16 md:py-24" stagger>
        <div className="mb-12 text-center">
          <MotionItem>
            <h2 className="font-display text-3xl font-bold md:text-4xl">Why RestaurantHub</h2>
            <p className="text-muted-foreground mt-3">
              Everything you need for memorable occasions
            </p>
          </MotionItem>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <MotionItem key={feature.title}>
              <Card className="luxury-card border-luxury-gold/15 h-full">
                <CardHeader>
                  <div className="bg-primary/10 mb-3 flex h-12 w-12 items-center justify-center rounded-lg">
                    <feature.icon className="text-primary h-6 w-6" aria-hidden />
                  </div>
                  <CardTitle className="font-display">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </MotionItem>
          ))}
        </div>
      </MotionSection>

      <section className="bg-muted/30 border-t py-16 md:py-24">
        <div className="container">
          {reducedMotion ? (
            <div className="mb-10 text-center">
              <h2 className="font-display text-3xl font-bold md:text-4xl">Our Branches</h2>
              <p className="text-muted-foreground mt-3">
                Three locations, one standard of excellence
              </p>
            </div>
          ) : (
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mb-10 text-center"
            >
              <h2 className="font-display text-3xl font-bold md:text-4xl">Our Branches</h2>
              <p className="text-muted-foreground mt-3">
                Three locations, one standard of excellence
              </p>
            </motion.div>
          )}
          <div className="grid gap-6 md:grid-cols-3">
            {Object.values(BRANCHES).map((branch, index) =>
              reducedMotion ? (
                <BranchCard key={branch.slug} branch={branch} />
              ) : (
                <motion.div
                  key={branch.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.45 }}
                >
                  <BranchCard branch={branch} />
                </motion.div>
              ),
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function HeroContent() {
  return (
    <>
      <p className="text-luxury-gold mb-4 inline-flex items-center gap-2 text-sm font-medium tracking-[0.2em] uppercase">
        <Sparkles className="h-4 w-4" aria-hidden />
        Fine Dining & Events
      </p>
      <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
        An Exceptional
        <span className="text-primary block">Dining Experience</span>
      </h1>
      <p className="text-muted-foreground mt-6 text-lg text-balance md:text-xl">
        Reserve your table at any of our three branches, or celebrate life&apos;s milestones at our
        premium 2nd-floor event venue.
      </p>
      <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Button size="lg" className="min-h-11 w-full shadow-md sm:w-auto" asChild>
          <Link href="/reservations">
            <Utensils className="mr-2 h-4 w-4" />
            Reserve a Table
          </Link>
        </Button>
        <Button size="lg" variant="outline" className="min-h-11 w-full sm:w-auto" asChild>
          <Link href="/events">Book Event Venue</Link>
        </Button>
      </div>
    </>
  );
}

function BranchCard({ branch }: { branch: (typeof BRANCHES)[keyof typeof BRANCHES] }) {
  return (
    <Card className="luxury-card group h-full">
      <CardHeader>
        <CardTitle className="font-display">{branch.label}</CardTitle>
        <CardDescription>{branch.tagline}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="link"
          className="text-primary px-0 transition-transform group-hover:translate-x-1"
          asChild
        >
          <Link href="/branches">View details →</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
