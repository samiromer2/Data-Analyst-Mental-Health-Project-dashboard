import { provincialExplorer } from "@/lib/report";
import { PBIX_CONSTANTS } from "@/lib/report-constants";
import { KpiCard } from "@/components/report/report-ui";
import { CanadaChoropleth } from "@/components/report/canada-choropleth";

export const metadata = { title: "Analytics Report — Provincial Explorer" };

export default async function ProvincialPage() {
  const { period, byProvince, highestBurden, lowestBurden } = await provincialExplorer();

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Highest regional burden" value={highestBurden} sub="Fair / poor mental health" />
        <KpiCard label="Lowest regional burden" value={lowestBurden} sub="Fair / poor mental health" />
        <KpiCard
          label="Population concentration"
          value={PBIX_CONSTANTS.regionalConcentration}
          sub="Share of national distress volume in Ontario + Quebec"
        />
      </section>

      <section className="border border-outline bg-surface-lowest p-6">
        <h2 className="text-lg font-semibold text-charcoal">
          Fair / poor mental health by province — {period}
        </h2>
        <p className="mb-4 text-sm text-on-variant">
          Darker regions report a higher share of adults rating their mental health fair or poor.
        </p>
        <CanadaChoropleth
          data={byProvince}
          caption="Territories and small provinces are more often suppressed."
        />
      </section>

      <section className="border border-outline bg-surface-lowest p-6">
        <h2 className="mb-4 text-lg font-semibold text-charcoal">Ranked, {period}</h2>
        <ul className="grid gap-1 sm:grid-cols-2">
          {byProvince.map((row) => (
            <li
              key={row.geo}
              className="flex items-center justify-between border-b border-outline py-1.5 text-sm"
            >
              <span className="text-on-variant">{row.geo}</span>
              <span className="font-semibold text-charcoal">
                {row.value == null ? "—" : `${row.value}%`}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
