"use client";

import { Loader2, Phone, ShieldCheck } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { sendPhoneOtp, verifyPhoneOtp } from "@/actions/auth/otp";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PhoneOtpVerification() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSend() {
    startTransition(async () => {
      const result = await sendPhoneOtp({ phone });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setSent(true);
      toast.success(result.message);
    });
  }

  function handleVerify() {
    startTransition(async () => {
      const result = await verifyPhoneOtp({ phone, code });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setVerified(true);
      toast.success(result.message);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Phone className="h-4 w-4" />
          Phone verification (SMS OTP)
        </CardTitle>
        <CardDescription>
          Verify your phone number via Twilio SMS for booking reminders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {verified ? (
          <p className="flex items-center gap-2 text-sm text-emerald-600">
            <ShieldCheck className="h-4 w-4" />
            Phone number verified successfully
          </p>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="otp-phone">Mobile number</Label>
              <Input
                id="otp-phone"
                type="tel"
                placeholder="+63 917 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={sent}
              />
            </div>
            {sent && (
              <div className="space-y-2">
                <Label htmlFor="otp-code">6-digit code</Label>
                <Input
                  id="otp-code"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                />
              </div>
            )}
            <div className="flex gap-2">
              {!sent ? (
                <Button disabled={isPending || !phone} onClick={handleSend}>
                  {isPending ? <Loader2 className="animate-spin" /> : "Send code"}
                </Button>
              ) : (
                <>
                  <Button disabled={isPending || code.length !== 6} onClick={handleVerify}>
                    {isPending ? <Loader2 className="animate-spin" /> : "Verify"}
                  </Button>
                  <Button variant="outline" disabled={isPending} onClick={() => setSent(false)}>
                    Change number
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
