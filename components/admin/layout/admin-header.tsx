import Link from "next/link";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { signOut } from "@/lib/auth";

interface AdminHeaderProps {
  title: string;
  description?: string;
  userName: string;
  unreadNotifications?: number;
}

export function AdminHeader({
  title,
  description,
  userName,
  unreadNotifications = 0,
}: AdminHeaderProps) {
  return (
    <header className="bg-card/80 hidden border-b backdrop-blur lg:block">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/admin/notifications">
              <Bell className="h-4 w-4" />
              {unreadNotifications > 0 && (
                <span className="bg-destructive text-destructive-foreground absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
            </Link>
          </Button>
          <ThemeToggle />
          <span className="text-muted-foreground hidden text-sm md:inline">{userName}</span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
