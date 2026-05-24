"use server";

import { randomBytes } from "crypto";

import { prisma } from "@/lib/prisma";
import { clientEnv } from "@/lib/env";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { sendPasswordResetEmail } from "@/services/email";
import { toActionError } from "@/utils/errors";

const RESET_TOKEN_EXPIRY_HOURS = 1;

export async function requestPasswordReset(data: unknown) {
  try {
    const parsed = forgotPasswordSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false as const,
        error: parsed.error.issues[0]?.message ?? "Invalid email",
      };
    }

    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    const successMessage =
      "If an account exists for that email, we sent password reset instructions.";

    if (!user?.password) {
      return { success: true as const, message: successMessage };
    }

    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await prisma.verificationToken.create({
      data: { identifier: email, token, expires },
    });

    const resetUrl = `${clientEnv.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    await sendPasswordResetEmail({
      to: email,
      name: user.name,
      resetUrl,
    });

    return { success: true as const, message: successMessage };
  } catch (error) {
    return toActionError(error);
  }
}
