"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AdminNavItem } from "@/lib/admin/navigation";
import { APP_NAME } from "@/lib/constants";

interface AdminSidebarProps {
  navItems: AdminNavItem[];
  roleLabel: string;
}

export function AdminSidebar({ navItems, roleLabel }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navContent = (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <div className="bg-card sticky top-0 z-40 flex h-14 items-center gap-3 border-b px-4 lg:hidden">
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
        <span className="font-semibold">{APP_NAME} Admin</span>
        <span className="text-muted-foreground ml-auto text-xs">{roleLabel}</span>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "bg-card fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r transition-transform lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-14 items-center justify-between border-b px-4 lg:h-16">
          <div>
            <p className="text-sm font-bold tracking-tight">{APP_NAME}</p>
            <p className="text-muted-foreground text-xs">{roleLabel}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {navContent}
        <div className="mt-auto border-t p-3">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">← Back to site</Link>
          </Button>
        </div>
      </aside>
    </>
  );
}
