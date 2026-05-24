"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";

import { formatPrice } from "@/lib/events/constants";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface PackageCardData {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: { toString(): string } | number;
  features: string[];
  maxGuests: number | null;
  isFeatured: boolean;
}

interface PackageCardsProps {
  packages: PackageCardData[];
  venueSlug: string;
  selectedId?: string;
  onSelect?: (id: string) => void;
  showBookLink?: boolean;
}

export function PackageCards({
  packages,
  venueSlug,
  selectedId,
  onSelect,
  showBookLink = true,
}: PackageCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {packages.map((pkg, index) => {
        const price = Number(pkg.price);
        const isSelected = selectedId === pkg.id;

        return (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={cn(
                "relative h-full overflow-hidden transition-all",
                pkg.isFeatured && "border-amber-500/50 shadow-lg shadow-amber-500/10",
                isSelected && "ring-2 ring-amber-500",
                onSelect && "cursor-pointer hover:border-amber-500/50",
              )}
              onClick={() => onSelect?.(pkg.id)}
            >
              {pkg.isFeatured && (
                <div className="absolute top-0 right-0 flex items-center gap-1 rounded-bl-lg bg-gradient-to-r from-amber-600 to-amber-500 px-3 py-1 text-xs font-semibold text-white">
                  <Sparkles className="h-3 w-3" />
                  Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="font-serif text-xl">{pkg.name}</CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
                <p className="pt-2 font-serif text-3xl text-amber-600 dark:text-amber-400">
                  {formatPrice(price)}
                </p>
                {pkg.maxGuests && (
                  <p className="text-muted-foreground text-xs">Up to {pkg.maxGuests} guests</p>
                )}
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              {showBookLink && !onSelect && (
                <CardFooter>
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500"
                  >
                    <Link href={`/events/${venueSlug}/book?package=${pkg.slug}`}>Inquire now</Link>
                  </Button>
                </CardFooter>
              )}
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
