import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Authentication Error",
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const messages: Record<string, string> = {
    Configuration: "Server configuration error. Contact support.",
    AccessDenied: "You do not have permission to sign in.",
    Verification: "The verification link has expired or was already used.",
    Default: "An error occurred during authentication.",
  };

  const message = error ? (messages[error] ?? messages.Default) : messages.Default;

  return (
    <AuthCard title="Authentication error" description={message}>
      <Button asChild className="w-full">
        <Link href="/auth/sign-in">Back to sign in</Link>
      </Button>
    </AuthCard>
  );
}
