"use server";

import { revalidatePath } from "next/cache";

import { getAdminScope } from "@/lib/admin/scope";
import { prisma } from "@/lib/prisma";
import { toActionError } from "@/utils/errors";

export async function getAdminNotifications() {
  try {
    const scope = await getAdminScope();

    const notifications = await prisma.notification.findMany({
      where: { userId: scope.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return { success: true as const, data: notifications };
  } catch (error) {
    return toActionError(error);
  }
}

export async function markNotificationRead(notificationId: string) {
  try {
    const scope = await getAdminScope();

    await prisma.notification.updateMany({
      where: { id: notificationId, userId: scope.userId },
      data: { isRead: true },
    });

    revalidatePath("/admin/notifications");

    return { success: true as const };
  } catch (error) {
    return toActionError(error);
  }
}

export async function markAllNotificationsRead() {
  try {
    const scope = await getAdminScope();

    await prisma.notification.updateMany({
      where: { userId: scope.userId, isRead: false },
      data: { isRead: true },
    });

    revalidatePath("/admin/notifications");

    return { success: true as const };
  } catch (error) {
    return toActionError(error);
  }
}
