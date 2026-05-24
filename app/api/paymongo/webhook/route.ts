import { NextResponse } from "next/server";

import type { PayMongoWebhookPayload } from "@/lib/payment/types";
import {
  isPayMongoWebhookConfigured,
  verifyPayMongoWebhookSignature,
} from "@/services/payment/paymongo";
import {
  completePaymentSuccess,
  extractPaymentIdFromCheckoutSession,
  extractPaidPaymentFromSession,
  markPaymentFailed,
} from "@/services/payment/process-payment";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isPayMongoWebhookConfigured()) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature =
    request.headers.get("paymongo-signature") ?? request.headers.get("Paymongo-Signature");

  const valid = verifyPayMongoWebhookSignature(rawBody, signature);
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: PayMongoWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as PayMongoWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = payload.data.attributes.type;
  const resource = payload.data.attributes.data;
  const resourceAttributes = resource.attributes as Record<string, unknown>;

  try {
    switch (eventType) {
      case "checkout_session.payment.paid": {
        const paymentId = extractPaymentIdFromCheckoutSession(resourceAttributes);
        if (!paymentId) break;

        const paidInfo = extractPaidPaymentFromSession(
          resourceAttributes as {
            payments?: {
              id: string;
              attributes: { status: string; source?: { type?: string } };
            }[];
          },
        );

        await completePaymentSuccess({
          paymentId,
          paymongoPaymentId: paidInfo?.paymentId ?? resource.id,
          paymongoSessionId: resource.id,
          sourceType: paidInfo?.sourceType,
        });
        break;
      }

      case "payment.failed":
      case "checkout_session.payment.failed": {
        const paymentId =
          extractPaymentIdFromCheckoutSession(resourceAttributes) ??
          (resourceAttributes.metadata as Record<string, string> | undefined)?.paymentId;

        if (paymentId) {
          await markPaymentFailed({
            paymentId,
            failureReason: (resourceAttributes.failed_message as string) ?? "Payment failed",
            paymongoSessionId: eventType.startsWith("checkout_session") ? resource.id : undefined,
          });
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[PayMongo webhook]", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
