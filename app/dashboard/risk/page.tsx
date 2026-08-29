import { BreakdownChart, TrendChart } from "@/components/charts/analytics-charts";
import { DataNotice } from "@/components/data-notice";
import { EmptyState } from "@/components/empty-state";
import { parseFilters } from "@/lib/filters";
import type { PageSearchParams } from "@/lib/params";
import { getBreakdown, getSeries } from "@/lib/query";

export const metadata = { title: "Risk Indicators" };

export default async function RiskPage({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const filters = parseFilters(await searchParams);
  const [series, ages] = await Promise.all([
    getSeries({
      ...filters,
      dataset: "suicidal_thoughts",
      indicator: filters.indicator ?? "Suicidal thoughts (15 years and over)",
    }),
    getBreakdown({
      ...filters,
      dataset: "suicidal_thoughts",
      dimension: "age",
      indicator: filters.indicator ?? "Suicidal thoughts (15 years and over)",
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold text-charcoal">Risk Indicators</h1>
        <p className="mt-2 text-on-variant">
          Suicidal thoughts, professional consultation, and flourishing mental
          health — ideation and service contact, not suicide deaths.
        </p>
      </header>
      <DataNotice>
        This page does not report a suicide mortality rate. If this content is
        distressing, call or text 9-8-8 in Canada, 24/7.
      </DataNotice>
      <section className="border border-outline bg-surface-lowest p-6">
        {series.length ? (
          <TrendChart points={series} title="Selected risk indicator across available cycles" />
        ) : (
          <EmptyState
            title="Risk table not uploaded"
            body="Add suicidal_thoughts.csv to data/processed/. The current source extract is 2015 and 2019 only."
          />
        )}
      </section>
      <section className="border border-outline bg-surface-lowest p-6">
        {ages.length ? (
          <BreakdownChart points={ages} title="Age groups, latest available cycle" />
        ) : (
          <EmptyState
            title="No age-specific risk values"
            body="Age groups appear from suicidal_thoughts.csv after the file is uploaded."
          />
        )}
      </section>
    </div>
  );
}
