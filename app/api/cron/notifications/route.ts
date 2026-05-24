import { NextResponse } from "next/server";

import { serverEnv } from "@/lib/env";
import { processPendingNotificationJobs, scheduleBookingReminders } from "@/services/notifications";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = serverEnv.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reminders = await scheduleBookingReminders();
  const queue = await processPendingNotificationJobs(50);

  return NextResponse.json({
    ok: true,
    reminders,
    queue,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  return GET(request);
}
