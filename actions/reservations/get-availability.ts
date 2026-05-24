"use server";

import {
  getAvailableTables,
  getBranchesForBooking,
  getTimeSlotsForBranch,
} from "@/services/reservations/availability";
import { toActionError } from "@/utils/errors";

export async function fetchBranches() {
  try {
    const branches = await getBranchesForBooking();
    return { success: true as const, data: branches };
  } catch (error) {
    return toActionError(error);
  }
}

export async function fetchTimeSlots(branchId: string, dateIso: string) {
  try {
    if (!branchId || !dateIso) {
      return { success: false as const, error: "Branch and date are required" };
    }
    const { slots, branch } = await getTimeSlotsForBranch(branchId, dateIso);
    return { success: true as const, data: { slots, branch } };
  } catch (error) {
    return toActionError(error);
  }
}

export async function fetchAvailableTables(params: {
  branchId: string;
  dateIso: string;
  time: string;
  guestCount: number;
}) {
  try {
    const { branchId, dateIso, time, guestCount } = params;
    if (!branchId || !dateIso || !time || guestCount < 1) {
      return { success: false as const, error: "Complete date, time, and guest count first" };
    }
    const tables = await getAvailableTables({ branchId, dateIso, time, guestCount });
    return { success: true as const, data: tables };
  } catch (error) {
    return toActionError(error);
  }
}
