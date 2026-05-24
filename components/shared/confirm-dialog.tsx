"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: "default" | "destructive";
  disabled?: boolean;
  triggerClassName?: string;
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  variant = "default",
  disabled,
  triggerClassName,
}: ConfirmDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild disabled={disabled}>
        <span className={cn("inline-flex", triggerClassName)}>{trigger}</span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              variant === "destructive"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : undefined
            }
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface ConfirmButtonProps extends ButtonProps {
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

export function ConfirmButton({
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  variant = "destructive",
  children,
  ...buttonProps
}: ConfirmButtonProps) {
  return (
    <ConfirmDialog
      trigger={
        <Button variant={variant} {...buttonProps}>
          {children}
        </Button>
      }
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      onConfirm={onConfirm}
      variant={variant === "destructive" ? "destructive" : "default"}
    />
  );
}
