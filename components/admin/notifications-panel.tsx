"use client";

import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { markAllNotificationsRead, markNotificationRead } from "@/actions/admin/notifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface NotificationRow {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export function NotificationsPanel({ notifications }: { notifications: NotificationRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function markRead(id: string) {
    startTransition(async () => {
      const result = await markNotificationRead(id);
      if (!result.success) toast.error(result.error);
      else router.refresh();
    });
  }

  function markAll() {
    startTransition(async () => {
      const result = await markAllNotificationsRead();
      if (!result.success) toast.error(result.error);
      else {
        toast.success("All marked as read");
        router.refresh();
      }
    });
  }

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-4">
      {unread > 0 && (
        <Button variant="outline" size="sm" disabled={isPending} onClick={markAll}>
          Mark all as read ({unread})
        </Button>
      )}
      <div className="space-y-2">
        {notifications.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="text-muted-foreground py-12 text-center">
              No notifications yet
            </CardContent>
          </Card>
        ) : (
          notifications.map((n) => (
            <Card
              key={n.id}
              className={cn("transition-colors", !n.isRead && "border-primary/30 bg-primary/5")}
            >
              <CardContent className="flex items-start justify-between gap-4 py-4">
                <div>
                  <p className="font-medium">{n.title}</p>
                  <p className="text-muted-foreground mt-1 text-sm">{n.message}</p>
                  <p className="text-muted-foreground mt-2 text-xs">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!n.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isPending}
                    onClick={() => markRead(n.id)}
                  >
                    Mark read
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
