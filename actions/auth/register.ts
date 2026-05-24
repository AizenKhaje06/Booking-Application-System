"use server";

import { hash } from "bcryptjs";
import { UserRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { toActionError } from "@/utils/errors";

export async function registerUser(data: unknown) {
  try {
    const parsed = registerSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false as const,
        error: parsed.error.issues[0]?.message ?? "Invalid input",
      };
    }

    const { name, email, password } = parsed.data;
    const phone = parsed.data.phone?.trim() || null;
    const normalizedEmail = email.toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return { success: false as const, error: "An account with this email already exists." };
    }

    const passwordHash = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        phone,
        password: passwordHash,
        role: UserRole.CUSTOMER,
      },
      select: { id: true, email: true, name: true },
    });

    return {
      success: true as const,
      message: "Account created successfully. You can now sign in.",
      data: user,
    };
  } catch (error) {
    return toActionError(error);
  }
}
