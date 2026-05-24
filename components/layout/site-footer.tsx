import Link from "next/link";

import { APP_NAME } from "@/lib/constants";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-luxury-gold/10 bg-muted/30 border-t">
      <div className="container flex flex-col gap-8 py-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <p className="font-display text-lg font-semibold">{APP_NAME}</p>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            Premium multi-branch dining and luxury event venue reservations across Main, North, and
            South.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Explore
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/branches" className="hover:text-primary transition-colors">
                  Branches
                </Link>
              </li>
              <li>
                <Link href="/reservations" className="hover:text-primary transition-colors">
                  Reservations
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-primary transition-colors">
                  Event Venue
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Account
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/account" className="hover:text-primary transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/auth/sign-in" className="hover:text-primary transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-luxury-gold/10 text-muted-foreground container border-t py-6 text-center text-xs">
        © {year} {APP_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
