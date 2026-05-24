"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider disableTransitionOnChange>
        <TooltipProvider delayDuration={300}>
          {children}
          <Toaster
            richColors
            closeButton
            position="top-right"
            toastOptions={{
              classNames: {
                toast: "border border-luxury-gold/15 shadow-lg",
              },
            }}
          />
        </TooltipProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
