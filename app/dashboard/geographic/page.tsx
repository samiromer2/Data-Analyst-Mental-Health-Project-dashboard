import { BreakdownChart } from "@/components/charts/analytics-charts";
import { DataNotice } from "@/components/data-notice";
import { EmptyState } from "@/components/empty-state";
import { parseFilters } from "@/lib/filters";
import type { PageSearchParams } from "@/lib/params";
import { getBreakdown } from "@/lib/query";

export const metadata = { title: "Geographic Analysis" };

export default async function GeographicPage({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const filters = parseFilters(await searchParams);
  const regions = await getBreakdown({
    ...filters,
    dataset: "perceived_mh_annual",
    dimension: "geo",
  });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold text-charcoal">Geographic Analysis</h1>
        <p className="mt-2 text-on-variant">
          Canada by province and territory. National totals and regional rollups
          are excluded from the ranking.
        </p>
      </header>
      <DataNotice>
        Territories and small provinces are more often suppressed. Missing bars
        mean the cell was not publishable, not that the value is zero.
      </DataNotice>
      <section className="border border-outline bg-surface-lowest p-6">
        {regions.length ? (
          <BreakdownChart
            points={regions}
            title="Selected indicator by province or territory"
            layout="horizontal"
          />
        ) : (
          <EmptyState
            title="No provincial series yet"
            body="Upload perceived_mh_annual.csv to compare provinces."
          />
        )}
      </section>
    </div>
  );
}
