/**
 * PayMongo payment integration — checkout sessions & webhooks.
 */

import { createHmac, timingSafeEqual } from "crypto";

import { clientEnv, serverEnv } from "@/lib/env";
import {
  PAYMONGO_PAYMENT_METHODS,
  phpToCentavos,
  type PayMongoCheckoutMethod,
} from "@/lib/payment/constants";
import type { PayMongoCheckoutSessionResponse } from "@/lib/payment/types";

const PAYMONGO_V1 = "https://api.paymongo.com/v1";

export function isPayMongoConfigured() {
  return Boolean(serverEnv.PAYMONGO_SECRET_KEY && serverEnv.PAYMONGO_PUBLIC_KEY);
}

export function isPayMongoWebhookConfigured() {
  return Boolean(serverEnv.PAYMONGO_WEBHOOK_SECRET);
}

function getAuthHeader() {
  const secretKey = serverEnv.PAYMONGO_SECRET_KEY;
  if (!secretKey) {
    throw new Error("PayMongo is not configured. Set PAYMONGO_SECRET_KEY in .env");
  }
  return `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;
}

export async function payMongoRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${PAYMONGO_V1}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthHeader(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`PayMongo API error (${response.status}): ${body}`);
  }

  return response.json() as Promise<T>;
}

export function getPayMongoPublicKey() {
  return serverEnv.PAYMONGO_PUBLIC_KEY ?? null;
}

export interface CreateCheckoutParams {
  paymentId: string;
  amountPhp: number;
  description: string;
  lineItemName: string;
  customerEmail: string;
  customerName: string;
  paymentMethodTypes?: PayMongoCheckoutMethod[];
}

export async function createPayMongoCheckoutSession(
  params: CreateCheckoutParams,
): Promise<{ sessionId: string; checkoutUrl: string }> {
  const baseUrl = clientEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const centavos = phpToCentavos(params.amountPhp);

  const body = {
    data: {
      attributes: {
        line_items: [
          {
            name: params.lineItemName,
            description: params.description,
            amount: centavos,
            currency: "PHP",
            quantity: 1,
          },
        ],
        payment_method_types: params.paymentMethodTypes ?? [...PAYMONGO_PAYMENT_METHODS],
        description: params.description,
        reference_number: params.paymentId,
        send_email_receipt: true,
        show_description: true,
        show_line_items: true,
        success_url: `${baseUrl}/payments/success?paymentId=${params.paymentId}`,
        cancel_url: `${baseUrl}/payments/failed?paymentId=${params.paymentId}`,
        billing: {
          name: params.customerName,
          email: params.customerEmail,
        },
        metadata: {
          paymentId: params.paymentId,
        },
      },
    },
  };

  const result = await payMongoRequest<PayMongoCheckoutSessionResponse>("/checkout_sessions", {
    method: "POST",
    body: JSON.stringify(body),
  });

  const checkoutUrl = result.data.attributes.checkout_url;
  if (!checkoutUrl) {
    throw new Error("PayMongo did not return a checkout URL");
  }

  return {
    sessionId: result.data.id,
    checkoutUrl,
  };
}

export async function retrievePayMongoCheckoutSession(sessionId: string) {
  return payMongoRequest<PayMongoCheckoutSessionResponse>(`/checkout_sessions/${sessionId}`);
}

export function verifyPayMongoWebhookSignature(rawBody: string, signatureHeader: string | null) {
  const secret = serverEnv.PAYMONGO_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("PAYMONGO_WEBHOOK_SECRET is not configured");
  }
  if (!signatureHeader) {
    return false;
  }

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key?.trim(), value?.trim()];
    }),
  );

  const timestamp = parts.t;
  const signature = parts.te ?? parts.li;
  if (!timestamp || !signature) {
    return false;
  }

  const payload = `${timestamp}.${rawBody}`;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}
