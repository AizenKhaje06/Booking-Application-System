"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { EventType } from "@prisma/client";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Clock, Loader2, Phone, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { checkEventAvailability, createEventBooking } from "@/actions/events/create-booking";
import { EventCalendar } from "@/components/events/event-calendar";
import { PackageCards, type PackageCardData } from "@/components/events/package-cards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  calculateDeposit,
  EVENT_TIME_SLOTS,
  EVENT_TYPES,
  formatPrice,
} from "@/lib/events/constants";
import { formatTimeDisplay } from "@/lib/booking/time-slots";
import {
  createEventBookingSchema,
  type CreateEventBookingInput,
} from "@/lib/validations/event-booking";
import { cn } from "@/lib/utils";

interface EventBookingFormProps {
  venue: {
    id: string;
    slug: string;
    name: string;
    capacity: number;
    floor: number;
  };
  packages: PackageCardData[];
}

export function EventBookingForm({ venue, packages }: EventBookingFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const defaultPackageSlug = searchParams.get("package");
  const defaultPackage = packages.find((p) => p.slug === defaultPackageSlug);

  const form = useForm<CreateEventBookingInput>({
    resolver: zodResolver(createEventBookingSchema),
    defaultValues: {
      venueId: venue.id,
      packageId: defaultPackage?.id ?? "",
      eventType: EventType.WEDDING,
      guestCount: 50,
      eventDate: "",
      startTime: "16:00",
      endTime: "23:00",
      contactPhone: "",
      notes: "",
    },
  });

  const packageId = form.watch("packageId");
  const selectedPackage = packages.find((p) => p.id === packageId);
  const totalPrice = selectedPackage ? Number(selectedPackage.price) : 0;
  const deposit = calculateDeposit(totalPrice);

  useEffect(() => {
    if (session?.user?.name) {
      form.setValue("contactPhone", "");
    }
  }, [session, form]);

  async function verifyAvailability() {
    const values = form.getValues();
    if (!values.eventDate || !values.startTime || !values.endTime) return;

    setCheckingAvailability(true);
    const res = await checkEventAvailability({
      venueId: venue.id,
      eventDate: values.eventDate,
      startTime: values.startTime,
      endTime: values.endTime,
    });
    setCheckingAvailability(false);
    if (res.success) {
      setIsAvailable(res.data.available);
      if (!res.data.available) toast.error("This time slot is not available");
      else toast.success("Time slot is available!");
    }
  }

  function onSubmit(values: CreateEventBookingInput) {
    startTransition(async () => {
      const result = await createEventBooking(values);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      if (!result.data.paymentId) {
        toast.error("Payment could not be created");
        return;
      }
      toast.success("Proceed to pay your event deposit");
      router.push(`/payments/checkout?paymentId=${result.data.paymentId}`);
    });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <section>
              <h2 className="mb-4 font-serif text-2xl">Event type</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {EVENT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => form.setValue("eventType", type.value)}
                    className={cn(
                      "rounded-xl border p-4 text-left transition-all hover:border-amber-500/50",
                      form.watch("eventType") === type.value &&
                        "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500",
                    )}
                  >
                    <p className="font-semibold">{type.label}</p>
                    <p className="text-muted-foreground text-xs">{type.description}</p>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-4 font-serif text-2xl">Select package</h2>
              <PackageCards
                packages={packages}
                venueSlug={venue.slug}
                selectedId={packageId}
                onSelect={(id) => form.setValue("packageId", id)}
                showBookLink={false}
              />
              {form.formState.errors.packageId && (
                <p className="text-destructive mt-2 text-sm">Please select a package</p>
              )}
            </section>

            <section className="grid gap-6 md:grid-cols-2">
              <EventCalendar
                venueId={venue.id}
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  if (date) {
                    form.setValue("eventDate", format(date, "yyyy-MM-dd"));
                    setIsAvailable(null);
                  }
                }}
              />

              <Card className="border-amber-500/20">
                <CardHeader>
                  <CardTitle className="font-serif">Date & time</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start time</FormLabel>
                        <FormControl>
                          <select
                            className="border-input bg-background flex h-10 w-full rounded-md border px-3 text-sm"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              setIsAvailable(null);
                            }}
                          >
                            {EVENT_TIME_SLOTS.map((t) => (
                              <option key={t} value={t}>
                                {formatTimeDisplay(t)}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End time</FormLabel>
                        <FormControl>
                          <select
                            className="border-input bg-background flex h-10 w-full rounded-md border px-3 text-sm"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              setIsAvailable(null);
                            }}
                          >
                            {EVENT_TIME_SLOTS.map((t) => (
                              <option key={t} value={t}>
                                {formatTimeDisplay(t)}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="guestCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guest count</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={venue.capacity}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={verifyAvailability}
                    disabled={checkingAvailability || !form.watch("eventDate")}
                  >
                    {checkingAvailability ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>
                        <Clock className="mr-2 h-4 w-4" />
                        Check availability
                      </>
                    )}
                  </Button>
                  {isAvailable === true && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-emerald-600"
                    >
                      ✓ This slot is available
                    </motion.p>
                  )}
                  {isAvailable === false && (
                    <p className="text-destructive text-sm">This slot is not available</p>
                  )}
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="mb-4 font-serif text-2xl">Contact & inquiry</h2>
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="h-4 w-4" /> Phone
                        </FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+63 917 000 0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event details & special requests</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={4}
                            placeholder="Theme, catering preferences, setup needs..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </section>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-gradient-to-r from-amber-800 to-amber-600 hover:from-amber-700 hover:to-amber-500"
              disabled={isPending || isAvailable === false}
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Submitting inquiry...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Submit inquiry · Pay {formatPrice(deposit)} deposit
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>

      <aside className="space-y-6">
        <Card className="sticky top-24 border-amber-500/30 bg-gradient-to-b from-amber-950/5 to-transparent">
          <CardHeader>
            <CardTitle className="font-serif">Booking summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <span className="text-muted-foreground">Venue</span>
              <br />
              <strong>{venue.name}</strong>
              <br />
              <span className="text-muted-foreground">Main Branch · Floor {venue.floor}</span>
            </p>
            {selectedPackage && (
              <>
                <p>
                  <span className="text-muted-foreground">Package</span>
                  <br />
                  <strong>{selectedPackage.name}</strong>
                </p>
                <p>
                  <span className="text-muted-foreground">Package total</span>
                  <br />
                  <span className="font-serif text-2xl text-amber-600">
                    {formatPrice(totalPrice)}
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">Deposit (30% — pay now)</span>
                  <br />
                  <strong>{formatPrice(deposit)}</strong>
                </p>
              </>
            )}
            <p className="text-muted-foreground border-t pt-3 text-xs">
              Pay your deposit via GCash, Maya, or card. Admin reviews your inquiry after payment.
            </p>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
