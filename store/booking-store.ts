import { create } from "zustand";

export type BookingStep = "branch" | "date" | "time" | "guests" | "tables" | "details" | "review";

export interface BookingState {
  step: BookingStep;
  branchId: string | null;
  branchName: string | null;
  reservationDate: string | null; // YYYY-MM-DD
  reservationTime: string | null;
  guestCount: number;
  tableId: string | null;
  tableNumber: string | null;
  tableCapacity: number | null;
  notes: string;
  setStep: (step: BookingStep) => void;
  setBranch: (id: string, name: string) => void;
  setDate: (date: string) => void;
  setTime: (time: string) => void;
  setGuestCount: (count: number) => void;
  confirmGuests: () => void;
  setTable: (id: string, tableNumber: string, capacity: number) => void;
  setNotes: (notes: string) => void;
  reset: () => void;
}

const initialState = {
  step: "branch" as BookingStep,
  branchId: null,
  branchName: null,
  reservationDate: null,
  reservationTime: null,
  guestCount: 2,
  tableId: null,
  tableNumber: null,
  tableCapacity: null,
  notes: "",
};

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  setBranch: (branchId, branchName) =>
    set({
      branchId,
      branchName,
      reservationDate: null,
      reservationTime: null,
      tableId: null,
      tableNumber: null,
      tableCapacity: null,
      step: "date",
    }),
  setDate: (reservationDate) =>
    set({
      reservationDate,
      reservationTime: null,
      tableId: null,
      tableNumber: null,
      tableCapacity: null,
      step: "time",
    }),
  setTime: (reservationTime) =>
    set({
      reservationTime,
      tableId: null,
      tableNumber: null,
      tableCapacity: null,
      step: "guests",
    }),
  setGuestCount: (guestCount) =>
    set({
      guestCount,
      tableId: null,
      tableNumber: null,
      tableCapacity: null,
    }),
  confirmGuests: () => set({ step: "tables" }),
  setTable: (tableId, tableNumber, tableCapacity) =>
    set({ tableId, tableNumber, tableCapacity, step: "details" }),
  setNotes: (notes) => set({ notes }),
  reset: () => set(initialState),
}));
