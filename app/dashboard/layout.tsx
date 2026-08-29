import { Suspense } from "react";
import { DashboardNav } from "@/components/dashboard-nav";
import { FilterBar } from "@/components/filter-bar";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row">
      <Suspense fallback={null}>
        <DashboardNav />
      </Suspense>
      <div className="flex-1 px-4 py-8 md:px-10">
        <Suspense fallback={null}>
          <FilterBar />
        </Suspense>
        {children}
      </div>
    </div>
  );
}
