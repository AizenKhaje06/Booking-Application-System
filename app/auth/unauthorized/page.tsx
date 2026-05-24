import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Unauthorized",
};

export default function UnauthorizedPage() {
  return (
    <AuthCard
      title="Access denied"
      description="You don't have permission to view this page. Contact an administrator if you believe this is a mistake."
    >
      <div className="flex flex-col gap-2">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/auth/sign-in">Sign in with another account</Link>
        </Button>
      </div>
    </AuthCard>
  );
}
