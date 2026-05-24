import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

export const metadata = {
  title: "Sign In",
};

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
