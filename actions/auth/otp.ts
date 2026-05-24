"use server";

import { createHash, randomInt } from "crypto";

import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/services/notifications/sms-provider";
import { sendOtpSms } from "@/services/notifications";
import { toActionError } from "@/utils/errors";
import { z } from "zod";

const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;
const OTP_COOLDOWN_SECONDS = 60;

const sendOtpSchema = z.object({
  phone: z.string().min(10, "Enter a valid phone number"),
  purpose: z.string().default("verification"),
});

const verifyOtpSchema = z.object({
  phone: z.string().min(10),
  code: z.string().length(6, "Enter the 6-digit code"),
  purpose: z.string().default("verification"),
});

function hashOtp(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

export async function sendPhoneOtp(data: unknown) {
  try {
    const parsed = sendOtpSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false as const, error: parsed.error.issues[0]?.message };
    }

    const phone = normalizePhone(parsed.data.phone);
    const purpose = parsed.data.purpose;

    const recent = await prisma.otpVerification.findFirst({
      where: { phone, purpose },
      orderBy: { createdAt: "desc" },
    });

    if (recent && Date.now() - recent.createdAt.getTime() < OTP_COOLDOWN_SECONDS * 1000) {
      return {
        success: false as const,
        error: `Please wait ${OTP_COOLDOWN_SECONDS} seconds before requesting another code.`,
      };
    }

    const code = String(randomInt(100000, 999999));
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.otpVerification.deleteMany({ where: { phone, purpose } });
    await prisma.otpVerification.create({
      data: {
        phone,
        purpose,
        codeHash: hashOtp(code),
        expiresAt,
      },
    });

    await sendOtpSms({ phone, code });

    if (process.env.NODE_ENV !== "production") {
      console.info("[otp] Dev code for", phone, ":", code);
    }

    return {
      success: true as const,
      message: "Verification code sent via SMS.",
    };
  } catch (error) {
    return toActionError(error);
  }
}

export async function verifyPhoneOtp(data: unknown) {
  try {
    const parsed = verifyOtpSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false as const, error: parsed.error.issues[0]?.message };
    }

    const phone = normalizePhone(parsed.data.phone);
    const purpose = parsed.data.purpose;

    const record = await prisma.otpVerification.findFirst({
      where: { phone, purpose, verified: false },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return { success: false as const, error: "No active verification code. Request a new one." };
    }

    if (record.expiresAt < new Date()) {
      return { success: false as const, error: "Code expired. Request a new one." };
    }

    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      return { success: false as const, error: "Too many attempts. Request a new code." };
    }

    const valid = record.codeHash === hashOtp(parsed.data.code);

    if (!valid) {
      await prisma.otpVerification.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      return { success: false as const, error: "Invalid verification code." };
    }

    await prisma.otpVerification.update({
      where: { id: record.id },
      data: { verified: true },
    });

    return { success: true as const, message: "Phone number verified." };
  } catch (error) {
    return toActionError(error);
  }
}
