import { youthCrisis, YOUTH_AGE_OPTIONS } from "@/lib/report";
import { PBIX_CONSTANTS } from "@/lib/report-constants";
import { KpiCard, ChoiceSlicer } from "@/components/report/report-ui";
import { AreaTrend, GroupedBar } from "@/components/report/report-charts";

export const metadata = { title: "Analytics Report — Youth Crisis Monitor" };

export default async function YouthReportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const age = typeof params.age === "string" ? params.age : undefined;
  const { selectedAgeGroup, latestFiscalYear, admissionTrend, edVsInpatient } =
    await youthCrisis(age);

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          label="Peak youth inpatient rate"
          value={`${PBIX_CONSTANTS.peakInpatientRatePer100k.toLocaleString()}`}
          sub="per 100,000 — psychiatric admissions"
        />
        <KpiCard
          label="Eating disorder ED → inpatient"
          value={`${PBIX_CONSTANTS.eatingDisorderConversionPct}%`}
          sub="High-acuity: admissions outpace ED visits"
        />
        <KpiCard
          label="Anxiety disorder ED → inpatient"
          value={`${PBIX_CONSTANTS.anxietyConversionPct}%`}
          sub="High ED volume, low admission conversion"
        />
      </section>

      <section className="border border-outline bg-surface-lowest p-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-charcoal">
              Youth admission trend, 2018–2024
            </h2>
            <p className="text-sm text-on-variant">
              CIHI children &amp; youth, all diagnoses combined, both sexes — rate per 100,000.
            </p>
          </div>
          <ChoiceSlicer label="Age group" param="age" options={YOUTH_AGE_OPTIONS} />
        </div>
        <AreaTrend
          data={admissionTrend}
          series={["ED visit", "Hospitalisation"]}
          xKey="fiscal_year"
        />
        <p className="mt-2 text-xs text-slate">Showing: {selectedAgeGroup}</p>
      </section>

      <section className="border border-outline bg-surface-lowest p-6">
        <h2 className="text-lg font-semibold text-charcoal">
          ED visits vs. inpatient admissions by diagnosis — {latestFiscalYear}
        </h2>
        <p className="mb-4 text-sm text-on-variant">
          The conversion story: some diagnoses (eating disorders) go straight to admission;
          others (anxiety) generate large ED volume with fewer admissions.
        </p>
        <GroupedBar
          data={edVsInpatient}
          series={["ED visits", "Inpatient"]}
          xKey="category"
          unit=""
          horizontal
          height={420}
        />
      </section>
    </div>
  );
}
