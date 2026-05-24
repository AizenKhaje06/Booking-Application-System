"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { resetPassword } from "@/actions/auth/reset-password";
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
import { type ResetPasswordInput, resetPasswordSchema } from "@/lib/validations/auth";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      email,
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    form.setValue("token", token);
    form.setValue("email", email);
  }, [token, email, form]);

  async function onSubmit(values: ResetPasswordInput) {
    setIsLoading(true);
    try {
      const result = await resetPassword(values);

      if (!result.success) {
        toast.error(result.error ?? "Reset failed");
        return;
      }

      toast.success(result.message);
      router.push("/auth/sign-in");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!token || !email) {
    return (
      <AuthCard
        title="Invalid link"
        description="This password reset link is missing required parameters."
      >
        <Button asChild className="w-full">
          <Link href="/auth/forgot-password">Request a new link</Link>
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Reset password" description="Choose a new password for your account">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...form.register("token")} />
          <input type="hidden" {...form.register("email")} />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
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
                Updating...
              </>
            ) : (
              "Update password"
            )}
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
}
