import { Home } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container py-16 md:py-24">
      <EmptyState
        title="Page not found"
        description="The page you are looking for may have been moved or no longer exists."
        actionLabel="Back to home"
        actionHref="/"
      />
      <div className="mt-6 flex justify-center">
        <Button variant="ghost" asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Return home
          </Link>
        </Button>
      </div>
    </div>
  );
}
