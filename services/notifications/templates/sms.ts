import { clientEnv } from "@/lib/env";

const APP_NAME = clientEnv.NEXT_PUBLIC_APP_NAME;

export function reservationReminderSms({
  branchName,
  date,
  time,
}: {
  branchName: string;
  date: string;
  time: string;
}) {
  return `${APP_NAME}: Reminder — Table at ${branchName} on ${date} at ${time}. See you soon! Reply STOP to opt out.`;
}

export function otpSms({ code }: { code: string }) {
  return `${APP_NAME}: Your verification code is ${code}. Valid for 10 minutes. Do not share this code.`;
}

export function paymentReceiptSms({
  amount,
  description,
}: {
  amount: number;
  description: string;
}) {
  return `${APP_NAME}: Payment of ₱${amount.toLocaleString()} received for ${description}. Thank you!`;
}
