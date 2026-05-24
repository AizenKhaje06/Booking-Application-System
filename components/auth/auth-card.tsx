import { UtensilsCrossed } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function AuthCard({ title, description, children, footer, className }: AuthCardProps) {
  return (
    <Card className={cn("border-0 shadow-xl sm:border", className)}>
      <CardHeader className="space-y-1 text-center sm:text-left">
        <Link href="/" className="mb-2 inline-flex items-center gap-2 font-semibold">
          <UtensilsCrossed className="text-primary h-5 w-5" />
          {APP_NAME}
        </Link>
        <CardTitle className="text-2xl">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
      {footer && (
        <div className="text-muted-foreground border-t px-6 py-4 text-center text-sm">{footer}</div>
      )}
    </Card>
  );
}
