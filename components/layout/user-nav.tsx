"use client";

import { Calendar, LayoutDashboard, LogOut, Sparkles, User, Wallet } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { isAdminRole, ROLE_LABELS } from "@/lib/auth/roles";

export function UserNav() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Skeleton className="h-9 w-24" />;
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/auth/sign-in">Sign in</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/auth/register">Register</Link>
        </Button>
      </div>
    );
  }

  const role = session.user.role;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <User className="h-4 w-4" />
          <span className="max-w-[120px] truncate">{session.user.name ?? session.user.email}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{session.user.name}</p>
            <p className="text-muted-foreground text-xs">{session.user.email}</p>
            {role && <p className="text-primary text-xs">{ROLE_LABELS[role]}</p>}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account">
            <User className="mr-2 h-4 w-4" />
            My account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/payments">
            <Wallet className="mr-2 h-4 w-4" />
            Payments
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/reservations">
            <Calendar className="mr-2 h-4 w-4" />
            My reservations
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/events">
            <Sparkles className="mr-2 h-4 w-4" />
            My events
          </Link>
        </DropdownMenuItem>
        {isAdminRole(role) && (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Admin dashboard
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
