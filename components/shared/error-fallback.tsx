"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorFallbackProps {
  title?: string;
  message?: string;
  reset?: () => void;
}

export function ErrorFallback({
  title = "Something went wrong",
  message = "We could not load this page. Please try again.",
  reset,
}: ErrorFallbackProps) {
  return (
    <div className="container flex min-h-[50vh] items-center justify-center py-16">
      <Card className="luxury-card animate-fade-in w-full max-w-md">
        <CardHeader className="text-center">
          <div className="bg-destructive/10 mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full">
            <AlertTriangle className="text-destructive h-7 w-7" aria-hidden />
          </div>
          <CardTitle className="font-display">{title}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        {reset && (
          <CardContent className="flex justify-center">
            <Button className="min-h-11" onClick={reset}>
              Try again
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
