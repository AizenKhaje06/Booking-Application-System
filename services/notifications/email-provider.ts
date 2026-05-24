import { Resend } from "resend";

import { serverEnv } from "@/lib/env";

const resend = serverEnv.RESEND_API_KEY ? new Resend(serverEnv.RESEND_API_KEY) : null;

export function isEmailConfigured() {
  return Boolean(resend);
}

export async function sendRawEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not configured — skipping send to", to);
    return { id: "mock", skipped: true as const };
  }

  const result = await resend.emails.send({
    from: serverEnv.RESEND_FROM_EMAIL ?? "RestaurantHub <onboarding@resend.dev>",
    to,
    subject,
    html,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return { id: result.data?.id ?? "sent", skipped: false as const };
}
