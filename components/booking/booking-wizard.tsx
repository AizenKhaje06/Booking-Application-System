"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  Check,
  Clock,
  Loader2,
  Minus,
  Plus,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { format } from "date-fns";

import {
  fetchAvailableTables,
  fetchBranches,
  fetchTimeSlots,
} from "@/actions/reservations/get-availability";
import { createReservation } from "@/actions/reservations/create-reservation";
import { BookingEmptyState } from "@/components/booking/empty-state";
import {
  BranchListSkeleton,
  TableListSkeleton,
  TimeSlotSkeleton,
} from "@/components/booking/booking-skeleton";
import { ReservationSummary } from "@/components/booking/reservation-summary";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatTimeDisplay, isDateBookable } from "@/lib/booking/time-slots";
import { bookingCustomerSchema, type BookingCustomerInput } from "@/lib/validations/reservation";
import { useBookingStore, type BookingStep } from "@/store/booking-store";
import { cn } from "@/lib/utils";

import type { AvailableTable } from "@/services/reservations/availability";

const STEPS: { id: BookingStep; label: string }[] = [
  { id: "branch", label: "Branch" },
  { id: "date", label: "Date" },
  { id: "time", label: "Time" },
  { id: "guests", label: "Guests" },
  { id: "tables", label: "Table" },
  { id: "details", label: "Details" },
  { id: "review", label: "Confirm" },
];

interface BranchItem {
  id: string;
  name: string;
  slug: string;
  address: string;
  image: string | null;
  isMainBranch: boolean;
}

export function BookingWizard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();

  const store = useBookingStore();
  const {
    step,
    branchId,
    branchName,
    reservationDate,
    reservationTime,
    guestCount,
    tableId,
    tableNumber,
    tableCapacity,
    notes,
    setStep,
    setBranch,
    setDate,
    setTime,
    setGuestCount,
    confirmGuests,
    setTable,
    setNotes,
    reset,
  } = store;

  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [tables, setTables] = useState<AvailableTable[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);

  const customerForm = useForm<BookingCustomerInput>({
    resolver: zodResolver(bookingCustomerSchema),
    defaultValues: {
      name: session?.user?.name ?? "",
      email: session?.user?.email ?? "",
      phone: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (session?.user) {
      customerForm.reset({
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        phone: "",
        notes: store.notes,
      });
    }
  }, [session, customerForm, store.notes]);

  useEffect(() => {
    fetchBranches().then((res) => {
      if (res.success) setBranches(res.data);
      setLoadingBranches(false);
    });
  }, []);

  useEffect(() => {
    if (!branchId || !reservationDate) return;
    setLoadingSlots(true);
    fetchTimeSlots(branchId, reservationDate).then((res) => {
      if (res.success) setTimeSlots(res.data.slots);
      else toast.error(res.error);
      setLoadingSlots(false);
    });
  }, [branchId, reservationDate]);

  const loadTables = useCallback(() => {
    if (!branchId || !reservationDate || !reservationTime) return;
    setLoadingTables(true);
    fetchAvailableTables({
      branchId,
      dateIso: reservationDate,
      time: reservationTime,
      guestCount,
    }).then((res) => {
      if (res.success) setTables(res.data);
      else toast.error(res.error);
      setLoadingTables(false);
    });
  }, [branchId, reservationDate, reservationTime, guestCount]);

  useEffect(() => {
    if (step === "tables") loadTables();
  }, [step, loadTables]);

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  function goBack() {
    const prev = STEPS[stepIndex - 1];
    if (prev) setStep(prev.id);
  }

  function handleSubmitReservation() {
    if (!branchId || !reservationDate || !reservationTime || !tableId) return;

    const customer = customerForm.getValues();
    setNotes(customer.notes ?? "");

    startTransition(async () => {
      const result = await createReservation({
        branchId,
        tableId,
        reservationDate,
        reservationTime,
        guestCount,
        notes: customer.notes,
      });

      if (!result.success) {
        toast.error(result.error);
        if (
          result.error?.includes("no longer available") ||
          result.error?.includes("just booked")
        ) {
          setStep("tables");
          loadTables();
        }
        return;
      }

      toast.success("Reservation created — complete your deposit");
      reset();
      router.push(`/payments/checkout?paymentId=${result.data.paymentId}`);
    });
  }

  return (
    <div className="space-y-8">
      <nav className="flex flex-wrap gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors",
              i <= stepIndex ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
              i === stepIndex && "ring-primary ring-2 ring-offset-2",
            )}
          >
            <span className="bg-primary/20 flex h-5 w-5 items-center justify-center rounded-full text-[10px]">
              {i < stepIndex ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            <span className="hidden sm:inline">{s.label}</span>
          </div>
        ))}
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              {step === "branch" && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Select a branch</h2>
                  {loadingBranches ? (
                    <BranchListSkeleton />
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {branches.map((branch) => (
                        <button
                          key={branch.id}
                          type="button"
                          onClick={() => setBranch(branch.id, branch.name)}
                          className={cn(
                            "group hover:border-primary overflow-hidden rounded-xl border text-left transition-all hover:shadow-md",
                            branchId === branch.id && "border-primary ring-primary ring-2",
                          )}
                        >
                          {branch.image && (
                            <div className="relative h-32 w-full">
                              <Image
                                src={branch.image}
                                alt={branch.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 33vw"
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <div className="flex items-center gap-2">
                              <Building2 className="text-primary h-4 w-4" />
                              <span className="font-semibold">{branch.name}</span>
                              {branch.isMainBranch && (
                                <span className="bg-primary/10 text-primary rounded px-2 py-0.5 text-xs">
                                  Main
                                </span>
                              )}
                            </div>
                            <p className="text-muted-foreground mt-1 text-sm">{branch.address}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {step === "date" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={goBack}>
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-xl font-semibold">Choose a date</h2>
                  </div>
                  <Card>
                    <CardContent className="flex justify-center p-4">
                      <CalendarPicker
                        mode="single"
                        selected={
                          reservationDate ? new Date(reservationDate + "T12:00:00") : undefined
                        }
                        onSelect={(date) => {
                          if (date) setDate(format(date, "yyyy-MM-dd"));
                        }}
                        disabled={(date) => !isDateBookable(date)}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}

              {step === "time" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={goBack}>
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-xl font-semibold">Select a time</h2>
                  </div>
                  {loadingSlots ? (
                    <TimeSlotSkeleton />
                  ) : timeSlots.length === 0 ? (
                    <BookingEmptyState
                      title="No time slots"
                      description="This branch is closed on the selected date. Try another day."
                      actionLabel="Change date"
                      onAction={() => setStep("date")}
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {timeSlots.map((slot) => (
                        <Button
                          key={slot}
                          type="button"
                          variant={reservationTime === slot ? "default" : "outline"}
                          onClick={() => setTime(slot)}
                          className="min-w-[5rem]"
                        >
                          <Clock className="mr-1 h-4 w-4" />
                          {formatTimeDisplay(slot)}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {step === "guests" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={goBack}>
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-xl font-semibold">Number of guests</h2>
                  </div>
                  <Card>
                    <CardContent className="flex items-center justify-center gap-6 py-10">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={guestCount <= 1}
                        onClick={() => setGuestCount(guestCount - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="text-center">
                        <Users className="text-primary mx-auto mb-2 h-8 w-8" />
                        <span className="text-4xl font-bold">{guestCount}</span>
                        <p className="text-muted-foreground text-sm">guests</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={guestCount >= 20}
                        onClick={() => setGuestCount(guestCount + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                  <Button className="w-full" onClick={confirmGuests}>
                    Find available tables
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {step === "tables" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={goBack}>
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <h2 className="text-xl font-semibold">Available tables</h2>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadTables}
                      disabled={loadingTables}
                    >
                      Refresh
                    </Button>
                  </div>
                  {loadingTables ? (
                    <TableListSkeleton />
                  ) : tables.length === 0 ? (
                    <BookingEmptyState
                      title="No tables available"
                      description="Try a different time, fewer guests, or another branch."
                      actionLabel="Change time"
                      onAction={() => setStep("time")}
                    />
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {tables.map((table) => (
                        <button
                          key={table.id}
                          type="button"
                          onClick={() => setTable(table.id, table.tableNumber, table.capacity)}
                          className={cn(
                            "hover:border-primary rounded-xl border p-4 text-left transition-all hover:shadow-md",
                            tableId === table.id && "border-primary ring-primary ring-2",
                          )}
                        >
                          <p className="text-lg font-semibold">Table {table.tableNumber}</p>
                          <p className="text-muted-foreground text-sm">
                            Seats {table.capacity} · Floor {table.floor}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {step === "details" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={goBack}>
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-xl font-semibold">Your details</h2>
                  </div>
                  <Form {...customerForm}>
                    <form
                      className="space-y-4"
                      onSubmit={customerForm.handleSubmit(() => setStep("review"))}
                    >
                      <FormField
                        control={customerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={customerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" readOnly className="bg-muted" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={customerForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone (optional)</FormLabel>
                            <FormControl>
                              <Input type="tel" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={customerForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Special requests</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Allergies, celebration, seating preference..."
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  setNotes(e.target.value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full">
                        Review reservation
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  </Form>
                </div>
              )}

              {step === "review" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={goBack}>
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-xl font-semibold">Confirm reservation</h2>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Review your booking, then pay the deposit via GCash, Maya, or card to confirm
                    your table.
                  </p>
                  <Button
                    className="w-full"
                    size="lg"
                    disabled={isPending}
                    onClick={handleSubmitReservation}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Continue to payment
                      </>
                    )}
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="lg:col-span-1">
          {branchName && reservationDate && reservationTime ? (
            <ReservationSummary
              branchName={branchName}
              reservationDate={reservationDate}
              reservationTime={reservationTime}
              guestCount={guestCount}
              tableNumber={tableNumber}
              tableCapacity={tableCapacity}
              notes={notes || customerForm.watch("notes")}
              className="sticky top-24"
            />
          ) : (
            <Card className="sticky top-24 border-dashed">
              <CardContent className="text-muted-foreground py-8 text-center text-sm">
                <Calendar className="mx-auto mb-2 h-8 w-8 opacity-50" />
                Complete the steps to see your reservation summary
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
