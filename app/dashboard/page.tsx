import { BreakdownChart, TrendChart } from "@/components/charts/analytics-charts";
import { DataNotice } from "@/components/data-notice";
import { EmptyState } from "@/components/empty-state";
import { MetricCard } from "@/components/metric-card";
import { parseFilters } from "@/lib/filters";
import type { PageSearchParams } from "@/lib/params";
import { getBreakdown, getInsights, getMetrics, getSeries } from "@/lib/query";

export const metadata = { title: "Dashboard" };

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const filters = parseFilters(await searchParams);
  const [metrics, series, regions, insights] = await Promise.all([
    getMetrics(filters),
    getSeries({ ...filters, dataset: "perceived_mh_annual" }),
    getBreakdown({ ...filters, dataset: "perceived_mh_annual", dimension: "geo" }),
    getInsights(filters),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold text-charcoal">Mental Health Analytics</h1>
        <p className="mt-2 text-on-variant">
          Curated overview of perceived mental health, cycle-to-cycle change, and
          provincial contrast.
        </p>
      </header>
      <DataNotice>
        Figures are population-level Statistics Canada estimates. Suppressed cells
        are omitted, not imputed. This is not individual risk prediction.
      </DataNotice>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((card) => (
          <MetricCard key={card.id} card={card} />
        ))}
      </section>
      <section className="grid gap-6 lg:grid-cols-12">
        <div className="border border-outline bg-surface-lowest p-6 lg:col-span-8">
          {series.length ? (
            <TrendChart
              points={series}
              title="How has the selected indicator changed across CCHS cycles?"
            />
          ) : (
            <EmptyState
              title="Trend data not uploaded"
              body="Add perceived_mh_annual.csv to data/processed/ to load cycle-to-cycle values."
            />
          )}
        </div>
        <div className="border border-outline bg-surface-dim p-6 lg:col-span-4">
          <h2 className="text-lg font-semibold text-charcoal">Key observations</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-on-variant">
            {insights.slice(0, 3).map((item) => (
              <li key={item.id}>{item.available ? item.statement : item.statement}</li>
            ))}
          </ul>
        </div>
      </section>
      <section className="border border-outline bg-surface-lowest p-6">
        {regions.length ? (
          <BreakdownChart
            points={regions}
            title="Provincial comparison, latest available cycle"
            layout="horizontal"
          />
        ) : (
          <EmptyState
            title="Provincial comparison not uploaded"
            body="Province bars appear from perceived_mh_annual.csv after the file is added."
          />
        )}
      </section>
    </div>
  );
}
