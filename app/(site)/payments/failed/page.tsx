import { XCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getPaymentForCheckout } from "@/actions/payments";
import { PaymentStatusBadge } from "@/components/payments/payment-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/events/constants";
import { getCurrentUser } from "@/lib/session";

export const metadata = { title: "Payment failed" };

export default async function PaymentFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ paymentId?: string; reason?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");

  const { paymentId, reason } = await searchParams;

  let payment:
    | Extract<Awaited<ReturnType<typeof getPaymentForCheckout>>, { success: true }>["data"]
    | null = null;
  if (paymentId) {
    const result = await getPaymentForCheckout(paymentId);
    if (result.success) payment = result.data;
  }

  const message =
    reason === "timeout"
      ? "We could not verify your payment in time. If you were charged, check your transaction history or contact support."
      : (payment?.failureReason ??
        "Your payment was cancelled or could not be processed. No charges were made.");

  return (
    <div className="container max-w-lg py-12 md:py-16">
      <div className="mb-8 text-center">
        <div className="bg-destructive/15 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <XCircle className="text-destructive h-10 w-10" />
        </div>
        <h1 className="text-3xl font-bold">Payment not completed</h1>
        <p className="text-muted-foreground mt-2">{message}</p>
      </div>

      {payment && (
        <Card className="mb-6">
          <CardContent className="flex items-center justify-between py-4 text-sm">
            <div>
              <p className="font-medium">Amount</p>
              <p className="text-muted-foreground">{formatPrice(payment.amount)}</p>
            </div>
            <PaymentStatusBadge status={payment.status} />
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        {paymentId && payment?.status !== "PAID" && (
          <Button asChild>
            <Link href={`/payments/checkout?paymentId=${paymentId}`}>Try again</Link>
          </Button>
        )}
        <Button variant="outline" asChild>
          <Link href="/account/payments">Transaction history</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
