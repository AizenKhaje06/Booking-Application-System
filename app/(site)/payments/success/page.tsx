import { PaymentStatus } from "@prisma/client";
import { CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { verifyPaymentStatus, getPaymentForCheckout } from "@/actions/payments";
import { PaymentStatusBadge } from "@/components/payments/payment-status-badge";
import { PaymentSuccessVerifier } from "@/components/payments/payment-success-verifier";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatTimeDisplay } from "@/lib/booking/display";
import { formatPrice } from "@/lib/events/constants";
import { getCurrentUser } from "@/lib/session";

export const metadata = { title: "Payment successful" };

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ paymentId?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");

  const { paymentId } = await searchParams;
  if (!paymentId) redirect("/account/payments");

  await verifyPaymentStatus(paymentId);
  const result = await getPaymentForCheckout(paymentId);

  if (!result.success) {
    redirect("/payments/failed?paymentId=" + paymentId);
  }

  const payment = result.data;

  if (payment.status !== PaymentStatus.PAID) {
    return (
      <div className="container max-w-lg py-16 text-center">
        <Loader2 className="text-primary mx-auto mb-4 h-10 w-10 animate-spin" />
        <h1 className="text-xl font-semibold">Verifying payment…</h1>
        <p className="text-muted-foreground mt-2">
          Please wait while we confirm your payment with PayMongo.
        </p>
        <PaymentSuccessVerifier paymentId={paymentId} />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-12 md:py-16">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold">Payment successful!</h1>
        <p className="text-muted-foreground mt-2">
          {formatPrice(payment.amount)} received via PayMongo
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <PaymentStatusBadge status={payment.status} />
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="space-y-3 py-6 text-sm">
          {payment.reservation && (
            <>
              <p>
                <span className="text-muted-foreground">Booking</span>
                <br />
                <strong>Table reservation — {payment.reservation.branchName}</strong>
              </p>
              <p>
                {formatDate(payment.reservation.date, "MMM d, yyyy")} ·{" "}
                {formatTimeDisplay(payment.reservation.time)} · {payment.reservation.guestCount}{" "}
                guests
              </p>
              <p className="text-emerald-600">Your reservation is now confirmed.</p>
            </>
          )}
          {payment.eventBooking && (
            <>
              <p>
                <span className="text-muted-foreground">Booking</span>
                <br />
                <strong>{payment.eventBooking.venueName}</strong>
              </p>
              <p>{payment.eventBooking.packageName}</p>
              <p className="text-muted-foreground">
                Deposit received. Your inquiry is pending admin approval (24–48 hrs).
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        {payment.reservation && (
          <Button asChild>
            <Link href={`/reservations/success?id=${payment.reservation.id}`}>
              View reservation
            </Link>
          </Button>
        )}
        {payment.eventBooking && (
          <Button asChild>
            <Link href={`/events/inquiry/success?id=${payment.eventBooking.id}`}>View inquiry</Link>
          </Button>
        )}
        <Button variant="outline" asChild>
          <Link href="/account/payments">Transaction history</Link>
        </Button>
      </div>
    </div>
  );
}
