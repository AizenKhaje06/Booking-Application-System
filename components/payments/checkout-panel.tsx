"use client";

import { CreditCard, Loader2, Smartphone, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { completeDemoPayment, getPaymentForCheckout, initiateCheckout } from "@/actions/payments";
import { PaymentStatusBadge } from "@/components/payments/payment-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatTimeDisplay } from "@/lib/booking/display";
import { formatPrice } from "@/lib/events/constants";
import { PAYMENT_METHOD_LABELS } from "@/lib/payment/constants";

interface CheckoutPanelProps {
  paymentId: string;
}

export function CheckoutPanel({ paymentId }: CheckoutPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<
    Extract<Awaited<ReturnType<typeof getPaymentForCheckout>>, { success: true }>["data"] | null
  >(null);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    getPaymentForCheckout(paymentId).then((res) => {
      if (!res.success) {
        toast.error(res.error);
        setLoading(false);
        return;
      }
      setPayment(res.data);
      setLoading(false);
      if (res.data.status === "PAID") {
        router.replace(`/payments/success?paymentId=${paymentId}`);
      }
    });
  }, [paymentId, router]);

  function handlePay() {
    startTransition(async () => {
      const result = await initiateCheckout(paymentId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      if (result.data.alreadyPaid) {
        router.push(`/payments/success?paymentId=${paymentId}`);
        return;
      }

      if ("demoMode" in result.data && result.data.demoMode) {
        setDemoMode(true);
        return;
      }

      if (result.data.checkoutUrl) {
        window.location.href = result.data.checkoutUrl;
      }
    });
  }

  function handleDemoPay() {
    startTransition(async () => {
      const result = await completeDemoPayment(paymentId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Demo payment completed");
      router.push(`/payments/success?paymentId=${paymentId}`);
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!payment) {
    return (
      <Card>
        <CardContent className="text-muted-foreground py-12 text-center">
          Payment not found or access denied.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Card className="border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Secure checkout</CardTitle>
          <p className="text-muted-foreground text-sm">
            Pay via PayMongo — GCash, Maya, or credit/debit card
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-muted-foreground text-sm">Amount due</p>
            <p className="text-primary font-serif text-3xl font-bold">
              {formatPrice(payment.amount)}
            </p>
            <div className="mt-2">
              <PaymentStatusBadge status={payment.status} />
            </div>
          </div>

          {payment.reservation && (
            <div className="space-y-1 text-sm">
              <p className="font-medium">Table reservation deposit</p>
              <p className="text-muted-foreground">{payment.reservation.branchName}</p>
              <p className="text-muted-foreground">
                {formatDate(payment.reservation.date, "MMM d, yyyy")} ·{" "}
                {formatTimeDisplay(payment.reservation.time)} · {payment.reservation.guestCount}{" "}
                guests
              </p>
            </div>
          )}

          {payment.eventBooking && (
            <div className="space-y-1 text-sm">
              <p className="font-medium">Event booking downpayment (30%)</p>
              <p className="text-muted-foreground">{payment.eventBooking.venueName}</p>
              <p className="text-muted-foreground">
                {payment.eventBooking.packageName} ·{" "}
                {formatDate(payment.eventBooking.eventDate, "MMM d, yyyy")}
              </p>
            </div>
          )}

          <div className="text-muted-foreground grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg border p-3">
              <Smartphone className="mx-auto mb-1 h-5 w-5" />
              GCash
            </div>
            <div className="rounded-lg border p-3">
              <Wallet className="mx-auto mb-1 h-5 w-5" />
              Maya
            </div>
            <div className="rounded-lg border p-3">
              <CreditCard className="mx-auto mb-1 h-5 w-5" />
              Card
            </div>
          </div>

          {!demoMode ? (
            <Button className="w-full" size="lg" disabled={isPending} onClick={handlePay}>
              {isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                `Pay ${formatPrice(payment.amount)}`
              )}
            </Button>
          ) : (
            <div className="space-y-3 rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 p-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                PayMongo keys are not configured. Use demo mode to simulate a successful payment in
                development.
              </p>
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-500"
                disabled={isPending}
                onClick={handleDemoPay}
              >
                Complete demo payment ({PAYMENT_METHOD_LABELS.GCASH})
              </Button>
            </div>
          )}

          <p className="text-muted-foreground text-center text-xs">
            Payments are processed securely by PayMongo. Your card details never touch our servers.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
