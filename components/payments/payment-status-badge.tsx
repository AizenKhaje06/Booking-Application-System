import { PaymentStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { PAYMENT_STATUS_LABELS } from "@/lib/payment/constants";

const VARIANTS: Record<
  PaymentStatus,
  "success" | "warning" | "destructive" | "muted" | "secondary"
> = {
  PENDING: "warning",
  PAID: "success",
  FAILED: "destructive",
  REFUNDED: "muted",
  CANCELLED: "secondary",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge variant={VARIANTS[status]}>{PAYMENT_STATUS_LABELS[status] ?? status}</Badge>;
}
