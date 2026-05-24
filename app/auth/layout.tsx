import { UtensilsCrossed } from "lucide-react";
import Link from "next/link";

import { APP_NAME } from "@/lib/constants";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="from-primary/90 via-primary to-primary/70 text-primary-foreground relative hidden overflow-hidden bg-gradient-to-br p-12 lg:flex lg:flex-col lg:justify-between">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-lg font-semibold">
            <UtensilsCrossed className="h-6 w-6" />
            {APP_NAME}
          </Link>
        </div>
        <div className="space-y-4">
          <blockquote className="text-2xl leading-relaxed font-medium">
            &ldquo;Fine dining across three branches — plus an unforgettable event venue on our main
            floor.&rdquo;
          </blockquote>
          <p className="text-primary-foreground/80 text-sm">
            Book tables, plan celebrations, and manage reservations in one place.
          </p>
        </div>
        <p className="text-primary-foreground/60 text-xs">
          © {new Date().getFullYear()} {APP_NAME}
        </p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
