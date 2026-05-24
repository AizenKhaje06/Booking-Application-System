import { APP_NAME, BRANCHES } from "@/lib/constants";
import { siteConfig } from "@/lib/seo";

export function RestaurantJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: APP_NAME,
    description: siteConfig.description,
    url: siteConfig.url,
    servesCuisine: "Fine Dining",
    priceRange: "$$$",
    location: Object.values(BRANCHES).map((branch) => ({
      "@type": "Place",
      name: branch.label,
      description: branch.tagline,
    })),
    potentialAction: {
      "@type": "ReserveAction",
      target: `${siteConfig.url}/reservations`,
      name: "Reserve a Table",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
