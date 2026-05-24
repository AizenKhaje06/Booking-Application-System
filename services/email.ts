/**
 * Backward-compatible email exports — delegates to notification service.
 */
export {
  sendCancellationNotice as sendCancellationEmail,
  sendDepositPending as sendDepositPendingEmail,
  sendEventBookingConfirmation as sendEventBookingConfirmationEmail,
  sendEventInquiryReceived as sendEventBookingInquiryEmail,
  sendPasswordReset as sendPasswordResetEmail,
  sendPaymentFailed as sendPaymentFailedEmail,
  sendPaymentReceipt as sendPaymentReceiptEmail,
  sendReservationConfirmation as sendReservationConfirmationEmail,
} from "@/services/notifications";

export { sendRawEmail as sendEmail } from "@/services/notifications/email-provider";
