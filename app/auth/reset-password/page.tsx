import { Suspense } from "react";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

export const metadata = {
  title: "Reset Password",
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
