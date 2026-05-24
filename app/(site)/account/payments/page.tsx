import Link from "next/link";
import { redirect } from "next/navigation";

import { getCustomerPaymentHistory } from "@/actions/payments";
import { PaymentHistoryList } from "@/components/payments/payment-history-list";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/session";

export const metadata = { title: "Transaction history" };

export default async function AccountPaymentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in?callbackUrl=/account/payments");

  const result = await getCustomerPaymentHistory();
  const payments = result.success ? result.data : [];

  return (
    <>
      <PageHeader
        title="Transaction history"
        description="Deposits and payments for reservations and events"
      >
        <Button variant="outline" asChild>
          <Link href="/account">← Account</Link>
        </Button>
      </PageHeader>
      <div className="container pb-16">
        <PaymentHistoryList payments={payments} />
      </div>
    </>
  );
}
