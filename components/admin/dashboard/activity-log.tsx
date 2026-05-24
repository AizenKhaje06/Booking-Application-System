import { formatDistanceToNow } from "date-fns";
import { Activity, Bell, Calendar, PartyPopper } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "reservation" | "event" | "notification";
  title: string;
  description: string;
  createdAt: Date;
}

const ICONS = {
  reservation: Calendar,
  event: PartyPopper,
  notification: Bell,
};

export function ActivityLog({ items }: { items: ActivityItem[] }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-center gap-2">
        <Activity className="text-primary h-4 w-4" />
        <CardTitle className="text-base font-semibold">Activity log</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">No recent activity</p>
        ) : (
          <ul className="space-y-4">
            {items.map((item) => {
              const Icon = ICONS[item.type];
              return (
                <li key={item.id} className="flex gap-3">
                  <div
                    className={cn(
                      "bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    )}
                  >
                    <Icon className="text-muted-foreground h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-muted-foreground truncate text-xs">{item.description}</p>
                    <p className="text-muted-foreground/80 mt-0.5 text-xs">
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
