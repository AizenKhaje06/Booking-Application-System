"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import Link from "next/link";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { fadeInUp } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  const reducedMotion = useReducedMotion();
  const Wrapper = reducedMotion ? "div" : motion.div;
  const wrapperProps = reducedMotion
    ? {
        className: cn(
          "flex flex-col items-center justify-center rounded-xl border border-dashed border-luxury-gold/25 bg-muted/20 px-6 py-14 text-center",
          className,
        ),
      }
    : {
        variants: fadeInUp,
        initial: "hidden",
        animate: "visible",
        className: cn(
          "flex flex-col items-center justify-center rounded-xl border border-dashed border-luxury-gold/25 bg-muted/20 px-6 py-14 text-center",
          className,
        ),
      };

  return (
    <Wrapper {...wrapperProps}>
      <div className="bg-primary/10 mb-4 flex h-14 w-14 items-center justify-center rounded-full">
        <Icon className="text-primary h-7 w-7" aria-hidden />
      </div>
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">{description}</p>
      {actionLabel && actionHref && (
        <Button variant="outline" className="mt-6 min-h-11" asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
      {actionLabel && onAction && !actionHref && (
        <Button variant="outline" className="mt-6 min-h-11" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Wrapper>
  );
}
