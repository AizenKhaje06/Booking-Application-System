import { CalendarX } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";

interface BookingEmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

/** @deprecated Use EmptyState from @/components/shared/empty-state */
export function BookingEmptyState(props: BookingEmptyStateProps) {
  return <EmptyState icon={CalendarX} {...props} />;
}
