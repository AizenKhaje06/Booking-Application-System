"use client";

import { format } from "date-fns";
import Link from "next/link";
import { PaymentStatus } from "@prisma/client";

import { PaymentStatusBadge } from "@/components/payments/payment-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/events/constants";
import { PAYMENT_METHOD_LABELS } from "@/lib/payment/constants";

type PaymentRow = {
  id: string;
  amount: { toString(): string };
  paymentMethod: string;
  paymentStatus: string;
  bookingType: string;
  transactionId: string | null;
  createdAt: Date;
  reservation: { id: string; branch: { name: string }; reservationDate: Date } | null;
  eventBooking: { id: string; venue: { name: string }; eventDate: Date } | null;
};

export function PaymentHistoryList({ payments }: { payments: PaymentRow[] }) {
  if (payments.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="text-muted-foreground py-12 text-center">
          No transactions yet. Payments appear here after you book a table or event.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {payments.map((payment) => {
        const label =
          payment.bookingType === "RESERVATION"
            ? `Reservation · ${payment.reservation?.branch.name ?? "Branch"}`
            : `Event · ${payment.eventBooking?.venue.name ?? "Venue"}`;

        const date =
          payment.reservation?.reservationDate ??
          payment.eventBooking?.eventDate ??
          payment.createdAt;

        return (
          <Card key={payment.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div className="space-y-1 text-sm">
                <p className="font-medium">{label}</p>
                <p className="text-muted-foreground">{format(new Date(date), "MMM d, yyyy")}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <PaymentStatusBadge status={payment.paymentStatus as PaymentStatus} />
                  <Badge variant="outline">
                    {PAYMENT_METHOD_LABELS[payment.paymentMethod] ?? payment.paymentMethod}
                  </Badge>
                </div>
                {payment.transactionId && (
                  <p className="text-muted-foreground font-mono text-xs">
                    Ref: {payment.transactionId.slice(0, 20)}…
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-serif text-xl font-semibold">
                  {formatPrice(Number(payment.amount))}
                </p>
                {payment.paymentStatus === "PENDING" && (
                  <Button size="sm" className="mt-2" asChild>
                    <Link href={`/payments/checkout?paymentId=${payment.id}`}>Pay now</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
