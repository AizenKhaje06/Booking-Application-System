import { PaymentMethod } from "@prisma/client";

export interface PayMongoCheckoutSessionResponse {
  data: {
    id: string;
    attributes: {
      checkout_url: string;
      status: string;
      reference_number?: string;
      payments?: {
        id: string;
        attributes: {
          status: string;
          source?: {
            type?: string;
          };
        };
      }[];
    };
  };
}

export interface PayMongoWebhookPayload {
  data: {
    id: string;
    type: string;
    attributes: {
      type: string;
      livemode: boolean;
      data: {
        id: string;
        type: string;
        attributes: Record<string, unknown>;
      };
    };
  };
}

export function mapPayMongoSourceToMethod(sourceType?: string | null): PaymentMethod {
  switch (sourceType?.toLowerCase()) {
    case "gcash":
      return PaymentMethod.GCASH;
    case "paymaya":
      return PaymentMethod.PAYMAYA;
    case "card":
      return PaymentMethod.CARD;
    default:
      return PaymentMethod.PAYMONGO;
  }
}
