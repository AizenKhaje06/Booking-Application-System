"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GallerySliderProps {
  images: string[];
  alt?: string;
  className?: string;
}

export function GallerySlider({ images, alt = "Venue gallery", className }: GallerySliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  if (images.length === 0) return null;

  return (
    <div className={cn("group relative overflow-hidden rounded-2xl", className)}>
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {images.map((src, index) => (
            <div key={src} className="relative min-w-0 flex-[0_0_100%]">
              <div className="relative aspect-[16/10] md:aspect-[21/9]">
                <Image
                  src={src}
                  alt={`${alt} ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute top-1/2 left-4 z-10 -translate-y-1/2 opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
            onClick={scrollPrev}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute top-1/2 right-4 z-10 -translate-y-1/2 opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
            onClick={scrollNext}
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === selectedIndex ? "w-8 bg-amber-400" : "w-1.5 bg-white/50",
                )}
                onClick={() => emblaApi?.scrollTo(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
