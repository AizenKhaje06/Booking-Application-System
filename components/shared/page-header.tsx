import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, className, children }: PageHeaderProps) {
  return (
    <div className={cn("container py-10 md:py-14", className)}>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl space-y-2">
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
          {description && (
            <p className="text-muted-foreground text-lg text-balance">{description}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
