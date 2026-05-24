"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { requestPasswordReset } from "@/actions/auth/forgot-password";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type ForgotPasswordInput, forgotPasswordSchema } from "@/lib/validations/auth";

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordInput) {
    setIsLoading(true);
    try {
      const result = await requestPasswordReset(values);

      if (!result.success) {
        toast.error(result.error ?? "Request failed");
        return;
      }

      setSubmitted(true);
      toast.success(result.message);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthCard
      title="Forgot password"
      description="We'll email you a link to reset your password"
      footer={
        <Link href="/auth/sign-in" className="text-primary font-medium hover:underline">
          Back to sign in
        </Link>
      }
    >
      {submitted ? (
        <p className="text-muted-foreground text-center text-sm">
          Check your inbox for reset instructions. If you don&apos;t see it, check spam or try
          again.
        </p>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Sending...
                </>
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>
        </Form>
      )}
    </AuthCard>
  );
}
