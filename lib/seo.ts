import type { Metadata, Viewport } from "next";

import { APP_NAME } from "@/lib/constants";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const siteConfig = {
  name: APP_NAME,
  url: siteUrl,
  description:
    "Premium multi-branch restaurant reservations and luxury event venue booking — Main, North, and South branches.",
  keywords: [
    "restaurant reservations",
    "fine dining",
    "event venue",
    "wedding venue",
    "corporate events",
    "table booking",
    APP_NAME,
  ],
};

export const baseMetadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "en_PH",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: siteConfig.url,
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1612" },
  ],
};

export function pageMetadata(
  title: string,
  description?: string,
  options?: { noIndex?: boolean },
): Metadata {
  return {
    title,
    description: description ?? siteConfig.description,
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description: description ?? siteConfig.description,
    },
    ...(options?.noIndex && { robots: { index: false, follow: false } }),
  };
}
