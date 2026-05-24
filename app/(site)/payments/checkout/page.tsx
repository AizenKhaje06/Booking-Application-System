import { redirect } from "next/navigation";

import { CheckoutPanel } from "@/components/payments/checkout-panel";
import { PageHeader } from "@/components/shared/page-header";
import { getCurrentUser } from "@/lib/session";

export const metadata = { title: "Checkout" };

export default async function PaymentCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ paymentId?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in?callbackUrl=/payments/checkout");

  const { paymentId } = await searchParams;
  if (!paymentId) redirect("/account/payments");

  return (
    <>
      <PageHeader
        title="Payment checkout"
        description="Complete your deposit securely via PayMongo"
      />
      <div className="container pb-16">
        <CheckoutPanel paymentId={paymentId} />
      </div>
    </>
  );
}
