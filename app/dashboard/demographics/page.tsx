import { BreakdownChart } from "@/components/charts/analytics-charts";
import { DataNotice } from "@/components/data-notice";
import { EmptyState } from "@/components/empty-state";
import { parseFilters } from "@/lib/filters";
import type { PageSearchParams } from "@/lib/params";
import { getBreakdown } from "@/lib/query";
import { datasetPresence } from "@/lib/store";

export const metadata = { title: "Demographics" };

export default async function DemographicsPage({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const filters = parseFilters(await searchParams);
  const { present } = await datasetPresence();
  const dataset = present.includes("stress_coping.csv")
    ? "stress_coping"
    : "suicidal_thoughts";
  const [ages, sexes] = await Promise.all([
    getBreakdown({ ...filters, dataset, dimension: "age" }),
    getBreakdown({ ...filters, dataset, dimension: "sex" }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold text-charcoal">Demographics</h1>
        <p className="mt-2 text-on-variant">
          Age and sex breaks from tables that actually have them. The core
          perceived mental health table is 18+ only.
        </p>
      </header>
      <DataNotice>
        Age is shown only when the loaded table supports it. Stress/coping and
        suicidal thoughts have age groups; perceived mental health does not.
      </DataNotice>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="border border-outline bg-surface-lowest p-6">
          {ages.length ? (
            <BreakdownChart points={ages} title="By age group" />
          ) : (
            <EmptyState
              title="No age break available"
              body="Upload stress_coping.csv or suicidal_thoughts.csv to compare age groups."
            />
          )}
        </section>
        <section className="border border-outline bg-surface-lowest p-6">
          {sexes.length ? (
            <BreakdownChart points={sexes} title="By sex" />
          ) : (
            <EmptyState
              title="No sex break available"
              body="Sex comparisons appear after a Track A table with sex is uploaded."
            />
          )}
        </section>
      </div>
    </div>
  );
}
