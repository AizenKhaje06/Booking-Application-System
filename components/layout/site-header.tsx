"use client";

import { Menu, UtensilsCrossed } from "lucide-react";
import Link from "next/link";

import { UserNav } from "@/components/layout/user-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { APP_NAME, NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="border-luxury-gold/10 bg-background/85 sticky top-0 z-50 w-full border-b backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link
          href="/"
          className="font-display flex items-center gap-2 text-lg font-semibold tracking-tight transition-opacity hover:opacity-80"
        >
          <UtensilsCrossed className="text-primary h-6 w-6" aria-hidden />
          <span>{APP_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserNav />
          <Button variant="outline" size="sm" className="hidden lg:inline-flex" asChild>
            <Link href="/reservations">Book a Table</Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100vw-2rem,320px)]">
              <SheetHeader>
                <SheetTitle className="font-display text-left">{APP_NAME}</SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-1" aria-label="Mobile navigation">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "rounded-lg px-3 py-3 text-base font-medium transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <Button asChild className="mt-4 min-h-11 w-full">
                  <Link href="/reservations">Book a Table</Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
