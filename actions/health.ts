"use server";

import { prisma } from "@/lib/prisma";
import { toActionError } from "@/utils/errors";

export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { success: true as const, message: "Database connected" };
  } catch (error) {
    return toActionError(error);
  }
}
