import { MainLayout } from "@/components/layout/main-layout";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}
