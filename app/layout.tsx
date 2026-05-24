import type { Metadata } from "next";
import { DM_Sans, Geist_Mono, Playfair_Display } from "next/font/google";

import { AppProviders } from "@/components/providers/app-providers";
import { SkipLink } from "@/components/shared/skip-link";
import { baseMetadata, viewport } from "@/lib/seo";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = baseMetadata;
export { viewport };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${playfair.variable} ${geistMono.variable} font-sans`}>
        <SkipLink />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
