import { ctaButton, detailBox, emailLayout } from "@/services/notifications/templates/layout";

export function reservationConfirmationTemplate({
  name,
  reservation,
  accountUrl,
}: {
  name: string;
  reservation: {
    id: string;
    branchName: string;
    branchAddress: string;
    date: string;
    time: string;
    guestCount: number;
    tableNumber: string;
    floor?: number;
    notes?: string | null;
  };
  accountUrl: string;
}) {
  const rows = [
    { label: "Branch", value: reservation.branchName },
    { label: "Date", value: reservation.date },
    { label: "Time", value: reservation.time },
    { label: "Guests", value: String(reservation.guestCount) },
    { label: "Table", value: reservation.tableNumber },
    ...(reservation.floor != null ? [{ label: "Floor", value: String(reservation.floor) }] : []),
    { label: "Address", value: reservation.branchAddress },
    ...(reservation.notes ? [{ label: "Notes", value: reservation.notes }] : []),
    { label: "Confirmation ID", value: reservation.id },
  ];

  return emailLayout({
    title: "Reservation confirmed",
    preheader: `Your table at ${reservation.branchName} is booked for ${reservation.date}`,
    body: `
      <p>Hi ${name},</p>
      <p>Your table reservation is <strong>confirmed</strong>. We look forward to welcoming you!</p>
      ${detailBox(rows)}
      ${ctaButton(accountUrl, "View my reservations")}
    `,
  });
}

export function eventBookingConfirmationTemplate({
  name,
  booking,
  accountUrl,
}: {
  name: string;
  booking: {
    id: string;
    venueName: string;
    eventType: string;
    date: string;
    startTime: string;
    endTime: string;
    packageName: string;
    totalPrice: number;
    depositAmount: number;
  };
  accountUrl: string;
}) {
  return emailLayout({
    title: "Event booking confirmed",
    preheader: `Your ${booking.eventType} at ${booking.venueName} is approved`,
    accent: "#92400e",
    body: `
      <p>Dear ${name},</p>
      <p>Wonderful news — your <strong>${booking.eventType}</strong> at <strong>${booking.venueName}</strong> has been approved!</p>
      ${detailBox([
        { label: "Venue", value: booking.venueName },
        { label: "Package", value: booking.packageName },
        { label: "Date", value: booking.date },
        { label: "Time", value: `${booking.startTime} – ${booking.endTime}` },
        { label: "Total", value: `₱${booking.totalPrice.toLocaleString()}` },
        { label: "Deposit paid", value: `₱${booking.depositAmount.toLocaleString()}` },
        { label: "Confirmation ID", value: booking.id },
      ])}
      ${ctaButton(accountUrl, "View my events", "#92400e")}
    `,
  });
}

export function paymentReceiptTemplate({
  name,
  receipt,
  accountUrl,
}: {
  name: string;
  receipt: {
    paymentId: string;
    amount: number;
    method: string;
    date: string;
    description: string;
    transactionId?: string | null;
  };
  accountUrl: string;
}) {
  return emailLayout({
    title: "Payment receipt",
    preheader: `Receipt for ₱${receipt.amount.toLocaleString()} — ${receipt.description}`,
    accent: "#059669",
    body: `
      <p>Hi ${name},</p>
      <p>Thank you for your payment. Here is your receipt:</p>
      ${detailBox([
        { label: "Description", value: receipt.description },
        { label: "Amount", value: `₱${receipt.amount.toLocaleString()}` },
        { label: "Method", value: receipt.method },
        { label: "Date", value: receipt.date },
        ...(receipt.transactionId
          ? [{ label: "Transaction ID", value: receipt.transactionId }]
          : []),
        { label: "Receipt ID", value: receipt.paymentId },
      ])}
      ${ctaButton(accountUrl, "View payment history", "#059669")}
    `,
  });
}

export function bookingReminderTemplate({
  name,
  booking,
  accountUrl,
}: {
  name: string;
  booking: {
    kind: "reservation" | "event";
    title: string;
    date: string;
    time: string;
    location: string;
  };
  accountUrl: string;
}) {
  return emailLayout({
    title: "Upcoming booking reminder",
    preheader: `Reminder: ${booking.title} on ${booking.date}`,
    body: `
      <p>Hi ${name},</p>
      <p>This is a friendly reminder about your upcoming ${booking.kind === "reservation" ? "reservation" : "event"}.</p>
      ${detailBox([
        { label: "Booking", value: booking.title },
        { label: "Date", value: booking.date },
        { label: "Time", value: booking.time },
        { label: "Location", value: booking.location },
      ])}
      ${ctaButton(accountUrl, "View details")}
      <p style="color:#78716c;font-size:14px;">Need to make changes? Sign in to your account as soon as possible.</p>
    `,
  });
}

export function cancellationNoticeTemplate({
  name,
  cancellation,
  accountUrl,
}: {
  name: string;
  cancellation: {
    kind: "reservation" | "event";
    title: string;
    date: string;
    reason?: string | null;
  };
  accountUrl: string;
}) {
  return emailLayout({
    title: "Booking cancelled",
    preheader: `Your ${cancellation.kind} has been cancelled`,
    accent: "#dc2626",
    body: `
      <p>Hi ${name},</p>
      <p>Your <strong>${cancellation.title}</strong> scheduled for <strong>${cancellation.date}</strong> has been cancelled.</p>
      ${cancellation.reason ? `<p style="background:#fef2f2;padding:12px;border-radius:8px;color:#991b1b;"><strong>Note:</strong> ${cancellation.reason}</p>` : ""}
      ${ctaButton(accountUrl, "View my account", "#dc2626")}
    `,
  });
}

export function passwordResetTemplate({ name, resetUrl }: { name: string; resetUrl: string }) {
  return emailLayout({
    title: "Reset your password",
    preheader: "Password reset request for your account",
    body: `
      <p>Hi ${name},</p>
      <p>We received a request to reset your password. Click the button below — this link expires in 1 hour.</p>
      ${ctaButton(resetUrl, "Reset password")}
      <p style="color:#78716c;font-size:14px;">If you didn't request this, you can safely ignore this email.</p>
    `,
  });
}

export function eventInquiryTemplate({
  name,
  booking,
}: {
  name: string;
  booking: {
    id: string;
    venueName: string;
    eventType: string;
    date: string;
    startTime: string;
    endTime: string;
    packageName: string;
    depositAmount: number;
    totalPrice: number;
  };
}) {
  return emailLayout({
    title: "Event inquiry received",
    preheader: `Deposit received — inquiry pending approval`,
    accent: "#92400e",
    body: `
      <p>Dear ${name},</p>
      <p>Thank you for your interest in hosting your <strong>${booking.eventType}</strong>. Your deposit has been received and your inquiry is <strong>pending approval</strong>.</p>
      ${detailBox([
        { label: "Venue", value: booking.venueName },
        { label: "Package", value: booking.packageName },
        { label: "Date", value: booking.date },
        { label: "Time", value: `${booking.startTime} – ${booking.endTime}` },
        { label: "Package total", value: `₱${booking.totalPrice.toLocaleString()}` },
        { label: "Deposit paid", value: `₱${booking.depositAmount.toLocaleString()}` },
        { label: "Reference", value: booking.id },
      ])}
      <p style="color:#78716c;font-size:14px;">Our events team will review your inquiry within 24–48 hours.</p>
    `,
  });
}

export function paymentFailedTemplate({
  name,
  payment,
  retryUrl,
}: {
  name: string;
  payment: { amount: number; description: string; reason?: string | null };
  retryUrl: string;
}) {
  return emailLayout({
    title: "Payment failed",
    preheader: "Your payment could not be processed",
    accent: "#dc2626",
    body: `
      <p>Hi ${name},</p>
      <p>We were unable to process your payment of <strong>₱${payment.amount.toLocaleString()}</strong> for ${payment.description}.</p>
      ${payment.reason ? `<p style="color:#78716c;">Reason: ${payment.reason}</p>` : ""}
      ${ctaButton(retryUrl, "Try again", "#dc2626")}
    `,
  });
}

export function depositPendingTemplate({
  name,
  deposit,
  checkoutUrl,
}: {
  name: string;
  deposit: { amount: number; description: string };
  checkoutUrl: string;
}) {
  return emailLayout({
    title: "Complete your deposit",
    preheader: `Pay ₱${deposit.amount.toLocaleString()} to confirm your booking`,
    body: `
      <p>Hi ${name},</p>
      <p>Your booking is almost ready! Please complete your deposit of <strong>₱${deposit.amount.toLocaleString()}</strong> for ${deposit.description}.</p>
      ${ctaButton(checkoutUrl, "Pay deposit now")}
      <p style="color:#78716c;font-size:14px;">We accept GCash, Maya, and credit/debit cards via PayMongo.</p>
    `,
  });
}
