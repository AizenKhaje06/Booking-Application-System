"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { verifyPaymentStatus } from "@/actions/payments";

export function PaymentSuccessVerifier({ paymentId }: { paymentId: string }) {
  const router = useRouter();

  useEffect(() => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts += 1;
      const result = await verifyPaymentStatus(paymentId);
      if (result.success && result.data.status === "PAID") {
        clearInterval(interval);
        router.refresh();
      }
      if (attempts >= 12) {
        clearInterval(interval);
        router.push(`/payments/failed?paymentId=${paymentId}&reason=timeout`);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [paymentId, router]);

  return null;
}
