import { Suspense } from "react";
import { BreakdownChart, TrendChart } from "@/components/charts/analytics-charts";
import { DataNotice } from "@/components/data-notice";
import { FilterBar } from "@/components/filter-bar";
import { parseFilters } from "@/lib/filters";
import type { PageSearchParams } from "@/lib/params";
import { getInsights } from "@/lib/query";
import type { BreakdownPoint, SeriesPoint } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Insights" };

function isSeries(points: SeriesPoint[] | BreakdownPoint[]): points is SeriesPoint[] {
  return points.length > 0 && "period" in points[0];
}

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const filters = parseFilters(await searchParams);
  const insights = await getInsights(filters);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 md:px-10">
      <header>
        <h1 className="text-3xl font-bold text-charcoal">Insights</h1>
        <p className="mt-2 text-on-variant">
          So what? Each block states a finding, shows the evidence, says what
          it does not mean, and names one thing communities can do.
        </p>
      </header>
      <Suspense fallback={null}>
        <FilterBar />
      </Suspense>
      <p className="text-sm text-slate">
        Province and sex change the story where the source table has that break.
        National figures are used when a selection is missing. The five findings
        stay on their source indicators.
      </p>
      <DataNotice>
        Language stays associational. These are population-level patterns, not
        individual risk. CCHS excludes people living on First Nations reserves,
        in institutions, and full-time military. If suicide-related content is
        distressing, call or text 9-8-8 in Canada.
      </DataNotice>
      {insights.map((item) => (
        <article key={item.id} className="border border-outline bg-surface-lowest p-6">
          <h2 className="text-xl font-semibold text-charcoal">{item.title}</h2>
          <p className="mt-3 text-lg leading-7 text-charcoal">{item.statement}</p>
          {item.points.length > 0 ? (
            <div className="mt-6">
              {isSeries(item.points) ? (
                <TrendChart points={item.points} title="Evidence" />
              ) : (
                <BreakdownChart
                  points={item.points}
                  title="Evidence"
                  layout={item.id === "place" ? "horizontal" : "vertical"}
                />
              )}
            </div>
          ) : null}
          <div className="mt-6 border-t border-outline pt-4">
            <p className="text-sm font-medium text-primary">What this means</p>
            <p className="mt-2 text-sm leading-6 text-on-variant">{item.meaning}</p>
            <p className="mt-4 text-sm font-medium text-primary">What communities can do</p>
            <p className="mt-2 text-sm leading-6 text-on-variant">{item.action}</p>
            <p className="mt-4 text-sm leading-6 text-slate">{item.caveat}</p>
            <p className="mt-3 text-xs text-slate">{item.source}</p>
          </div>
          {item.help ? (
            <div className="mt-4 border border-outline bg-surface-dim px-4 py-3">
              <p className="text-sm font-medium text-charcoal">
                If this is you or someone you know
              </p>
              <p className="mt-2 text-sm leading-6 text-on-variant">{item.help}</p>
              <p className="mt-2 text-sm leading-6">
                <a
                  href="https://www.988.ca"
                  className="text-primary underline underline-offset-2"
                >
                  9-8-8 Suicide Crisis Helpline
                </a>
                {" · "}
                <a
                  href="https://cmha.ca/find-help/"
                  className="text-primary underline underline-offset-2"
                >
                  Find local CMHA support
                </a>
              </p>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
