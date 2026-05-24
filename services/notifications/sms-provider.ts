import twilio from "twilio";

import { serverEnv } from "@/lib/env";

export function isSmsConfigured() {
  return Boolean(
    serverEnv.TWILIO_ACCOUNT_SID && serverEnv.TWILIO_AUTH_TOKEN && serverEnv.TWILIO_PHONE_NUMBER,
  );
}

function getClient() {
  if (!isSmsConfigured()) return null;
  return twilio(serverEnv.TWILIO_ACCOUNT_SID!, serverEnv.TWILIO_AUTH_TOKEN!);
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("63") && digits.length === 12) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 11) return `+63${digits.slice(1)}`;
  if (digits.length === 10) return `+63${digits}`;
  if (phone.startsWith("+")) return phone;
  return `+${digits}`;
}

export async function sendSms({ to, body }: { to: string; body: string }) {
  const client = getClient();
  const normalized = normalizePhone(to);

  if (!client) {
    console.info("[sms] Twilio not configured — mock SMS to", normalized, ":", body);
    return { sid: "mock", skipped: true as const };
  }

  const message = await client.messages.create({
    body,
    from: serverEnv.TWILIO_PHONE_NUMBER!,
    to: normalized,
  });

  return { sid: message.sid, skipped: false as const };
}
