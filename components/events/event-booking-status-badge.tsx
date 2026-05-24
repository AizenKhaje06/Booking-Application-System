import { EventBookingStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG: Record<
  EventBookingStatus,
  { label: string; variant: "success" | "warning" | "destructive" | "muted" | "secondary" }
> = {
  PENDING: { label: "Pending approval", variant: "warning" },
  CONFIRMED: { label: "Confirmed", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "muted" },
  COMPLETED: { label: "Completed", variant: "secondary" },
  REJECTED: { label: "Not approved", variant: "destructive" },
};

export function EventBookingStatusBadge({ status }: { status: EventBookingStatus }) {
  const config = STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
