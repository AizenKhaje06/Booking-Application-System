import { Skeleton } from "@/components/ui/skeleton";

export function PageHeaderSkeleton() {
  return (
    <div className="container space-y-3 py-10 md:py-14">
      <Skeleton className="h-9 w-64 max-w-full" />
      <Skeleton className="h-5 w-96 max-w-full" />
    </div>
  );
}

export function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-48 rounded-xl" />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols: _cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-card space-y-4 rounded-lg border p-4">
      <div className="flex gap-3">
        <Skeleton className="h-10 max-w-sm flex-1" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-48" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="animate-fade-in container space-y-8 py-10">
      <PageHeaderSkeleton />
      <CardGridSkeleton count={3} />
    </div>
  );
}

export function ListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
  );
}
