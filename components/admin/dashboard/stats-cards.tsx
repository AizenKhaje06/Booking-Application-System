import { Building2, CalendarCheck, DollarSign, PartyPopper, Users, Clock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/events/constants";

interface StatsCardsProps {
  stats: {
    totalReservations: number;
    pendingReservations: number;
    todayReservations: number;
    totalEventBookings: number;
    pendingEvents: number;
    totalBranches: number;
    totalUsers: number;
    staffCount: number;
    totalRevenue: number;
    monthRevenue: number;
  };
  isSuperAdmin: boolean;
}

export function StatsCards({ stats, isSuperAdmin }: StatsCardsProps) {
  const cards = [
    {
      title: "Total revenue",
      value: formatPrice(stats.totalRevenue),
      sub: `${formatPrice(stats.monthRevenue)} this month`,
      icon: DollarSign,
      accent: "text-emerald-600",
    },
    {
      title: "Reservations",
      value: stats.totalReservations.toString(),
      sub: `${stats.pendingReservations} pending · ${stats.todayReservations} today`,
      icon: CalendarCheck,
      accent: "text-blue-600",
    },
    {
      title: "Event bookings",
      value: stats.totalEventBookings.toString(),
      sub: `${stats.pendingEvents} pending approval`,
      icon: PartyPopper,
      accent: "text-violet-600",
    },
    {
      title: isSuperAdmin ? "Branches" : "Staff",
      value: isSuperAdmin ? stats.totalBranches.toString() : stats.staffCount.toString(),
      sub: isSuperAdmin ? `${stats.totalUsers} admin users` : `${stats.staffCount} team members`,
      icon: isSuperAdmin ? Building2 : Users,
      accent: "text-amber-600",
    },
    {
      title: "Pending actions",
      value: (stats.pendingReservations + stats.pendingEvents).toString(),
      sub: "Requires attention",
      icon: Clock,
      accent: "text-orange-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="border-border/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.accent}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{card.value}</div>
              <p className="text-muted-foreground mt-1 text-xs">{card.sub}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
