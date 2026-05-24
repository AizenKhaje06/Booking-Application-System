"use client";

import { format } from "date-fns";
import { Check, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { EventBookingStatus, EventType } from "@prisma/client";

import { reviewEventBooking } from "@/actions/events/admin";
import { EventBookingStatusBadge } from "@/components/events/event-booking-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusConfirmDialog } from "@/components/shared/status-confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { EVENT_TYPE_LABELS, formatPrice } from "@/lib/events/constants";
import { formatDate, formatTimeDisplay } from "@/lib/booking/display";

export interface AdminEventBooking {
  id: string;
  eventType: EventType;
  guestCount: number;
  eventDate: Date;
  startTime: string;
  endTime: string;
  status: EventBookingStatus;
  totalPrice: { toString(): string };
  depositAmount: { toString(): string } | null;
  notes: string | null;
  contactPhone: string | null;
  packageName: string | null;
  createdAt: Date;
  customer: { name: string; email: string; phone: string | null };
  venue: { name: string; slug: string };
  package: { name: string } | null;
}

export function EventApprovalList({ bookings }: { bookings: AdminEventBooking[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [rejectId, setRejectId] = useState<string | null>(null);

  function handleReview(bookingId: string, action: "approve" | "reject") {
    startTransition(async () => {
      const result = await reviewEventBooking({
        bookingId,
        action,
        adminNotes: adminNotes[bookingId],
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(action === "approve" ? "Booking approved" : "Booking rejected");
      setRejectId(null);
      router.refresh();
    });
  }

  if (bookings.length === 0) {
    return (
      <EmptyState
        title="No pending inquiries"
        description="New event venue submissions will appear here for your review."
      />
    );
  }

  return (
    <>
      <div className="space-y-6">
        {bookings.map((booking) => (
          <Card key={booking.id} className="luxury-card border-luxury-gold/20 overflow-hidden">
            <CardHeader className="bg-muted/30 flex flex-row items-start justify-between">
              <div>
                <CardTitle className="font-display">
                  {EVENT_TYPE_LABELS[booking.eventType]} · {booking.venue.name}
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  {booking.customer.name} · {booking.customer.email}
                </p>
              </div>
              <EventBookingStatusBadge status={booking.status} />
            </CardHeader>
            <CardContent className="grid gap-6 pt-6 md:grid-cols-2">
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Date:</strong> {formatDate(booking.eventDate)} ·{" "}
                  {formatTimeDisplay(booking.startTime)} – {formatTimeDisplay(booking.endTime)}
                </p>
                <p>
                  <strong>Guests:</strong> {booking.guestCount}
                </p>
                <p>
                  <strong>Package:</strong> {booking.packageName ?? booking.package?.name}
                </p>
                <p>
                  <strong>Total:</strong> {formatPrice(Number(booking.totalPrice))} ·{" "}
                  <strong>Deposit:</strong> {formatPrice(Number(booking.depositAmount ?? 0))}
                </p>
                {booking.contactPhone && (
                  <p>
                    <strong>Phone:</strong> {booking.contactPhone}
                  </p>
                )}
                {booking.notes && (
                  <p className="bg-muted rounded-md p-2">
                    <strong>Notes:</strong> {booking.notes}
                  </p>
                )}
                <p className="text-muted-foreground text-xs">
                  Submitted {format(booking.createdAt, "PPp")}
                </p>
              </div>
              <div className="space-y-3">
                <Textarea
                  placeholder="Admin notes (optional, shown on rejection)"
                  value={adminNotes[booking.id] ?? ""}
                  onChange={(e) =>
                    setAdminNotes((prev) => ({ ...prev, [booking.id]: e.target.value }))
                  }
                />
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    className="min-h-11 flex-1 bg-emerald-600 hover:bg-emerald-500"
                    disabled={isPending}
                    onClick={() => handleReview(booking.id, "approve")}
                  >
                    {isPending ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Approve
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    className="min-h-11 flex-1"
                    disabled={isPending}
                    onClick={() => setRejectId(booking.id)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <StatusConfirmDialog
        open={!!rejectId}
        onOpenChange={(open) => !open && setRejectId(null)}
        title="Reject this event inquiry?"
        description="The customer will be notified that their booking was not approved. You can include notes above that will be shared with them."
        confirmLabel="Reject booking"
        loading={isPending}
        onConfirm={() => rejectId && handleReview(rejectId, "reject")}
      />
    </>
  );
}
