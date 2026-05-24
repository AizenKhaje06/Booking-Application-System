"use server";

import { hash } from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { toActionError } from "@/utils/errors";

export async function resetPassword(data: unknown) {
  try {
    const parsed = resetPasswordSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false as const,
        error: parsed.error.issues[0]?.message ?? "Invalid input",
      };
    }

    const { email, token, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const verification = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: normalizedEmail,
          token,
        },
      },
    });

    if (!verification || verification.expires < new Date()) {
      return {
        success: false as const,
        error: "This reset link is invalid or has expired. Please request a new one.",
      };
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return { success: false as const, error: "User not found." };
    }

    const passwordHash = await hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: passwordHash },
      }),
      prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: normalizedEmail,
            token,
          },
        },
      }),
    ]);

    return {
      success: true as const,
      message: "Password updated successfully. You can now sign in.",
    };
  } catch (error) {
    return toActionError(error);
  }
}
