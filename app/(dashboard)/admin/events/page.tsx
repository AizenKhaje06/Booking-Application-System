import { getPendingEventBookings, getAllEventBookingsForAdmin } from "@/actions/events/admin";
import { EventApprovalList } from "@/components/admin/event-approval-list";
import { AdminHeader } from "@/components/admin/layout/admin-header";
import { EventBookingStatusBadge } from "@/components/events/event-booking-status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { EVENT_TYPE_LABELS } from "@/lib/events/constants";
import { formatDate, formatTimeDisplay } from "@/lib/booking/display";
import { getCurrentUser } from "@/lib/session";

export const metadata = { title: "Event bookings" };

export default async function AdminEventsPage() {
  const user = await getCurrentUser();

  const [pendingResult, allResult] = await Promise.all([
    getPendingEventBookings(),
    getAllEventBookingsForAdmin(),
  ]);

  const pending = pendingResult.success ? pendingResult.data : [];
  const recent = allResult.success
    ? allResult.data.filter((b) => b.status !== "PENDING").slice(0, 10)
    : [];

  return (
    <>
      <AdminHeader
        title="Event bookings"
        description="Review and approve event venue inquiries"
        userName={user?.name ?? "Admin"}
      />
      <div className="flex-1 space-y-10 p-4 lg:p-6">
        <section>
          <h2 className="mb-4 text-lg font-semibold">Pending approvals ({pending.length})</h2>
          <EventApprovalList bookings={pending} />
        </section>

        {recent.length > 0 && (
          <section>
            <h2 className="text-muted-foreground mb-4 text-lg font-semibold">Recently reviewed</h2>
            <div className="space-y-3">
              {recent.map((b) => (
                <Card key={b.id}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
                    <div className="text-sm">
                      <p className="font-medium">
                        {EVENT_TYPE_LABELS[b.eventType]} · {b.customer.name}
                      </p>
                      <p className="text-muted-foreground">
                        {formatDate(b.eventDate)} · {formatTimeDisplay(b.startTime)}
                      </p>
                    </div>
                    <EventBookingStatusBadge status={b.status} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
