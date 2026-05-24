import Link from "next/link";

export function SkipLink() {
  return (
    <Link
      href="#main-content"
      className="focus:bg-primary focus:text-primary-foreground focus:ring-ring sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:px-4 focus:py-2 focus:ring-2 focus:outline-none"
    >
      Skip to main content
    </Link>
  );
}
