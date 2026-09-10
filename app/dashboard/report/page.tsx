import { executiveOverview } from "@/lib/report";
import { PBIX_CONSTANTS, PROVINCES } from "@/lib/report-constants";
import { KpiCard, ChoiceSlicer } from "@/components/report/report-ui";
import { MultiLineChart } from "@/components/report/report-charts";

export const metadata = { title: "Analytics Report — Executive Overview" };

export default async function ReportOverviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const region = typeof params.region === "string" ? params.region : undefined;
  const { trajectory, series, latestNationalRate } = await executiveOverview(region);

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          label="National fair / poor mental health"
          value={`${latestNationalRate}%`}
          sub="Latest CCHS cycle, age 15+"
        />
        <KpiCard
          label="Provinces worsening cycle-over-cycle"
          value={PBIX_CONSTANTS.provincesWorsening}
          sub="Every province moved in the worse direction"
        />
        <KpiCard
          label="Post-COVID adult health deterioration"
          value={`+${PBIX_CONSTANTS.postCovidDeteriorationMillions} M`}
          sub="Estimated additional adults reporting fair/poor health"
        />
      </section>

      <section className="border border-outline bg-surface-lowest p-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-charcoal">
              Fair / poor mental health trajectory by region
            </h2>
            <p className="text-sm text-on-variant">
              CCHS two-year cycles, perceived mental health &ldquo;fair or poor&rdquo;, both sexes.
            </p>
          </div>
          <ChoiceSlicer label="Region" param="region" options={PROVINCES} allLabel="All regions" />
        </div>
        <MultiLineChart data={trajectory} series={series} xKey="period" />
        <p className="mt-3 text-xs text-slate">
          There is no official Canada total in this table; the dashed line is the unweighted
          mean of the 13 provinces and territories and is directional only.
        </p>
      </section>
    </div>
  );
}
