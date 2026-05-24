import { ReservationStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG: Record<
  ReservationStatus,
  { label: string; variant: "success" | "warning" | "destructive" | "muted" | "secondary" }
> = {
  PENDING: { label: "Pending", variant: "warning" },
  CONFIRMED: { label: "Confirmed", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
  COMPLETED: { label: "Completed", variant: "muted" },
  NO_SHOW: { label: "No show", variant: "secondary" },
};

export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  const config = STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
