import { TrendChart } from "@/components/charts/analytics-charts";
import { DataNotice } from "@/components/data-notice";
import { EmptyState } from "@/components/empty-state";
import { parseFilters } from "@/lib/filters";
import type { PageSearchParams } from "@/lib/params";
import { getSeries } from "@/lib/query";

export const metadata = { title: "Trends" };

export default async function TrendsPage({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const filters = parseFilters(await searchParams);
  const series = await getSeries({ ...filters, dataset: "perceived_mh_annual" });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold text-charcoal">Trends</h1>
        <p className="mt-2 text-on-variant">
          Cycle-to-cycle comparison for the core CCHS perceived mental health table.
        </p>
      </header>
      <DataNotice>
        A single Canada-wide multi-year trend line is not well supported. These
        points are two-year CCHS cycles, and 2019–2024 includes COVID collection
        changes.
      </DataNotice>
      <section className="border border-outline bg-surface-lowest p-6">
        {series.length ? (
          <TrendChart points={series} title="Selected indicator by CCHS cycle" />
        ) : (
          <EmptyState
            title="No cycle series yet"
            body="Upload perceived_mh_annual.csv to compare 2019/20, 2021/22, and 2023/24."
          />
        )}
      </section>
    </div>
  );
}
